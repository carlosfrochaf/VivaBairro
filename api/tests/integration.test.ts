import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

// Cada execução cria e remove somente seu próprio schema, nunca os dados locais.
test('fluxos com PostgreSQL real e permissões por território', async (t) => {
  const url = new URL(
    process.env.TEST_DATABASE_URL ??
      'postgresql://vivabairro:local-development-only@127.0.0.1:54329/vivabairro',
  );
  const admin = new pg.Pool({ connectionString: url.toString() });
  const schema = 'test_' + randomUUID().replaceAll('-', '');
  await admin.query(`CREATE SCHEMA ${schema}`);
  url.searchParams.set('options', `-c search_path=${schema},public`);
  process.env.DATABASE_URL = url.toString();
  const { pool } = await import('../src/db.js');
  const { buildApp } = await import('../src/app.js');
  const { hashPassword, newToken, tokenHash } = await import('../src/security.js');
  const app = await buildApp();
  const auth: Record<string, string> = {};
  const ids: Record<string, string> = {};
  const call = (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    who?: string,
    body?: object,
  ) =>
    app.inject({
      method,
      url: path,
      headers: who ? { authorization: 'Bearer ' + auth[who] } : {},
      payload: body,
    });
  try {
    await pool.query(
      await readFile(new URL('../migrations/001_initial.sql', import.meta.url), 'utf8'),
    );
    await pool.query(
      await readFile(new URL('../migrations/002_appeal_dates.sql', import.meta.url), 'utf8'),
    );
    await pool.query(
      await readFile(new URL('../migrations/003_product_flows.sql', import.meta.url), 'utf8'),
    );
    await pool.query(
      "INSERT INTO municipalities VALUES('town','Município teste'),('other','Outro município'); INSERT INTO neighborhoods VALUES('a','town','Bairro A',true),('b','town','Bairro B',true),('c','other','Bairro C',true)",
    );
    const hash = await hashPassword('test-password-long');
    for (const name of ['owner', 'one', 'two', 'mod', 'admin', 'outsider']) {
      ids[name] = randomUUID();
      auth[name] = newToken();
      await pool.query(
        "INSERT INTO accounts(id,name,email,password_hash,neighborhood_id) VALUES($1,$2,$3,$4,'a')",
        [ids[name], name, name + '@test.local', hash],
      );
      await pool.query("INSERT INTO sessions VALUES($1,$2,now()+interval '1 day')", [
        tokenHash(auth[name]),
        ids[name],
      ]);
    }
    for (const [name, role, municipality, neighborhood] of [
      ['mod', 'moderator', 'town', 'a'],
      ['admin', 'admin', 'town', null],
      ['outsider', 'admin', 'other', null],
    ])
      await pool.query(
        'INSERT INTO roles(id,account_id,municipality_id,neighborhood_id,role) VALUES($1,$2,$3,$4,$5)',
        [randomUUID(), ids[name!], municipality, neighborhood, role],
      );
    const notice = {
      kind: 'notice',
      title: 'Aviso da comunidade',
      description: 'Descrição suficiente para publicar.',
      location: 'Praça principal',
      neighborhood_id: 'a',
    };
    let postId = '',
      eventId = '',
      reportId = '',
      auditId = '';
    await t.test(
      'autenticação e cadastro não permitem autoatribuição de administrador',
      async () => {
        assert.equal((await call('GET', '/api/posts')).statusCode, 401);
        const r = await call('POST', '/api/auth/register', undefined, {
          name: 'Novo morador',
          email: 'new@test.local',
          password: 'password-long-enough',
          neighborhood_id: 'a',
          roles: [{ role: 'admin' }],
        });
        assert.equal(r.statusCode, 200);
        auth.new = r.json().token;
        assert.deepEqual((await call('GET', '/api/me', 'new')).json().roles, []);
        assert.equal(
          (
            await call('POST', '/api/auth/login', undefined, {
              email: 'new@test.local',
              password: 'wrong-password',
            })
          ).statusCode,
          401,
        );
        assert.equal(
          (
            await call('POST', '/api/posts', 'new', {
              ...notice,
              kind: 'official',
              issuer: 'Prefeitura',
            })
          ).statusCode,
          403,
        );
      },
    );
    await t.test('validação, edição e remoção são verificadas no servidor', async () => {
      assert.equal(
        (await call('POST', '/api/posts', 'owner', { ...notice, title: 'a' })).statusCode,
        422,
      );
      const r = await call('POST', '/api/posts', 'owner', notice);
      assert.equal(r.statusCode, 200);
      postId = r.json().id;
      assert.equal((await call('PUT', '/api/posts/' + postId, 'one', notice)).statusCode, 403);
      assert.equal((await call('DELETE', '/api/posts/' + postId, 'one')).statusCode, 403);
      assert.equal(
        (await call('PATCH', `/api/posts/${postId}/state`, 'owner', { state: 'resolvido' }))
          .statusCode,
        200,
      );
    });
    await t.test('última vaga não é duplicada em inscrições simultâneas', async () => {
      const r = await call('POST', '/api/posts', 'owner', {
        ...notice,
        kind: 'event',
        capacity: 1,
        starts_at: new Date(Date.now() + 86400000).toISOString(),
        ends_at: new Date(Date.now() + 90000000).toISOString(),
      });
      assert.equal(r.statusCode, 200);
      eventId = r.json().id;
      const results = await Promise.all(
        ['one', 'two'].map((who) => call('POST', `/api/posts/${eventId}/attendance`, who)),
      );
      assert.deepEqual(results.map((r) => r.statusCode).sort(), [200, 409]);
      const winner = results[0].statusCode === 200 ? 'one' : 'two';
      assert.equal(
        (await call('POST', `/api/posts/${eventId}/attendance`, winner)).statusCode,
        200,
      );
      assert.equal((await call('GET', '/api/posts/' + eventId, 'owner')).json().participants, 1);
      await call('DELETE', `/api/posts/${eventId}/attendance`, winner);
      assert.equal(
        (await call('POST', `/api/posts/${eventId}/attendance`, winner === 'one' ? 'two' : 'one'))
          .statusCode,
        200,
      );
    });
    await t.test('denúncia não oculta automaticamente e escopo é obrigatório', async () => {
      assert.equal(
        (
          await call('POST', `/api/posts/${postId}/reports`, 'one', {
            reason: 'Conteúdo que precisa de avaliação.',
          })
        ).statusCode,
        200,
      );
      assert.equal((await call('GET', '/api/posts/' + postId, 'two')).statusCode, 200);
      const queue = (await call('GET', '/api/moderation', 'mod')).json().items;
      assert.equal(queue.length, 1);
      assert.equal(queue[0].reporter_id, undefined);
      reportId = queue[0].id;
      assert.equal(
        (
          await call('POST', '/api/moderation/' + reportId, 'outsider', {
            action: 'hide',
            reason: 'Motivo da decisão.',
          })
        ).statusCode,
        403,
      );
      assert.equal(
        (
          await call('POST', '/api/moderation/' + reportId, 'mod', {
            action: 'hide',
            reason: 'Motivo da decisão.',
          })
        ).statusCode,
        200,
      );
      assert.equal((await call('GET', '/api/posts/' + postId, 'two')).statusCode, 404);
      const own = (await call('GET', '/api/posts/' + postId, 'owner')).json();
      assert.equal(own.visibility, 'hidden');
      auditId = own.history.find((h: any) => h.action === 'hide').id;
      assert.equal(
        (
          await call('POST', '/api/moderation/' + reportId, 'mod', {
            action: 'restore',
            reason: 'Repetir ação.',
          })
        ).statusCode,
        409,
      );
    });
    await t.test('revisão exige outra pessoa e restaura conteúdo com histórico', async () => {
      assert.equal(
        (
          await call('POST', '/api/appeals', 'owner', {
            action_id: auditId,
            reason: 'Peço uma revisão do contexto.',
          })
        ).statusCode,
        200,
      );
      const appeal = (await call('GET', '/api/moderation/appeals', 'admin')).json().items[0];
      assert.equal(
        (
          await call('POST', '/api/moderation/appeals/' + appeal.id, 'mod', {
            action: 'restore',
            reason: 'Revisão da decisão.',
          })
        ).statusCode,
        403,
      );
      assert.equal(
        (
          await call('POST', '/api/moderation/appeals/' + appeal.id, 'admin', {
            action: 'restore',
            reason: 'Revisão da decisão.',
          })
        ).statusCode,
        200,
      );
      assert.equal((await call('GET', '/api/posts/' + postId, 'two')).statusCode, 200);
    });
    await t.test(
      'admin não atribui permissões fora do município; revogação é imediata',
      async () => {
        assert.equal(
          (
            await call('POST', '/api/admin/moderators', 'admin', {
              email: 'one@test.local',
              neighborhood_id: 'c',
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await call('POST', '/api/admin/moderators', 'admin', {
              email: 'mod@test.local',
              neighborhood_id: 'a',
              revoke: true,
            })
          ).statusCode,
          200,
        );
        assert.deepEqual((await call('GET', '/api/me', 'mod')).json().roles, []);
      },
    );
    await t.test(
      'resumo do perfil conta apenas conteúdo e participações da própria conta',
      async () => {
        const owner = await call('GET', '/api/me/overview', 'owner');
        assert.equal(owner.statusCode, 200);
        assert.deepEqual(owner.json().counts, { activities: 0, notices: 1, neighborhoods: 1 });
        assert.equal(owner.json().notices[0].id, postId);
        const visitor = (await call('GET', '/api/me/overview', 'outsider')).json();
        assert.equal(visitor.counts.notices, 0);
        assert.deepEqual(visitor.notices, []);
        assert.equal((await call('GET', '/api/me/overview')).statusCode, 401);
      },
    );
    await t.test(
      'prévia local permite preflight de edição e saída sem liberar origens externas',
      async () => {
        const response = await app.inject({
          method: 'OPTIONS',
          url: '/api/auth/session',
          headers: {
            origin: 'http://127.0.0.1:8088',
            'access-control-request-method': 'DELETE',
            'access-control-request-headers': 'authorization',
          },
        });
        assert.equal(response.statusCode, 204);
        assert.match(String(response.headers['access-control-allow-methods']), /DELETE/);
        assert.match(String(response.headers['access-control-allow-methods']), /PATCH/);
        const external = await app.inject({
          method: 'OPTIONS',
          url: '/api/auth/session',
          headers: {
            origin: 'https://external.example',
            'access-control-request-method': 'DELETE',
          },
        });
        assert.equal(external.headers['access-control-allow-origin'], undefined);
      },
    );
    await t.test(
      'autor de resposta removida consegue recorrer sem ser dono da publicação',
      async () => {
        await call('POST', '/api/posts/' + postId + '/replies', 'two', {
          body: 'Resposta de demonstração que será moderada.',
        });
        const reply = (
          await pool.query(
            'SELECT id FROM replies WHERE post_id=$1 AND author_id=$2 ORDER BY created_at DESC LIMIT 1',
            [postId, ids.two],
          )
        ).rows[0];
        await call('POST', '/api/posts/' + postId + '/reports', 'owner', {
          reply_id: reply.id,
          reason: 'Avaliar esta resposta específica.',
        });
        const report = (
          await pool.query("SELECT id FROM reports WHERE reply_id=$1 AND state='open'", [reply.id])
        ).rows[0];
        const moderated = await call('POST', '/api/moderation/' + report.id, 'admin', {
          action: 'hide',
          reason: 'Resposta ocultada para análise.',
        });
        assert.equal(moderated.statusCode, 200, moderated.body);
        const own = await call('GET', '/api/me/moderation', 'two');
        assert.equal(own.statusCode, 200, own.body);
        const action = own
          .json()
          .items.find(
            (a: { reply_body: string }) =>
              a.reply_body === 'Resposta de demonstração que será moderada.',
          );
        assert.ok(action);
        assert.equal(
          (
            await call('POST', '/api/appeals', 'owner', {
              action_id: action.id,
              reason: 'Eu sou dono da publicação, não da resposta.',
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await call('POST', '/api/appeals', 'two', {
              action_id: action.id,
              reason: 'Peço a revisão da minha resposta.',
            })
          ).statusCode,
          200,
        );
        assert.equal(
          (
            await call('POST', '/api/appeals', 'two', {
              action_id: action.id,
              reason: 'Tentativa de repetir o recurso.',
            })
          ).statusCode,
          409,
        );
      },
    );
    await t.test('feed agrega bairros acompanhados e valida o intervalo de datas', async () => {
      await pool.query(
        'INSERT INTO follows(account_id,neighborhood_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [ids.owner, 'b'],
      );
      const second = await call('POST', '/api/posts', 'two', {
        ...notice,
        neighborhood_id: 'b',
        title: 'Aviso do bairro acompanhado',
      });
      assert.equal(second.statusCode, 200, second.body);
      const feed = await call('GET', '/api/posts?neighborhood=followed', 'owner');
      assert.equal(feed.statusCode, 200, feed.body);
      assert.ok(feed.json().items.some((p: { id: string }) => p.id === second.json().id));
      const future = encodeURIComponent(new Date(Date.now() + 30 * 86400000).toISOString());
      assert.equal(
        (await call('GET', '/api/posts?from=' + future, 'owner')).json().items.length,
        0,
      );
      assert.equal(
        (await call('GET', '/api/posts?from=2026-11-09T00:00:00Z&to=2026-11-08T00:00:00Z', 'owner'))
          .statusCode,
        422,
      );
    });
    await t.test('imagens exigem autoria, formato válido e publicação visível', async () => {
      const sharp = (await import('sharp')).default;
      const data = (
        await sharp({ create: { width: 20, height: 20, channels: 3, background: '#286a72' } })
          .png()
          .toBuffer()
      ).toString('base64');
      const uploaded = await call('POST', '/api/media', 'owner', { data });
      assert.equal(uploaded.statusCode, 200, uploaded.body);
      const photo_id = uploaded.json().id;
      assert.equal((await call('GET', '/api/media/' + photo_id, 'two')).statusCode, 404);
      assert.equal(
        (await call('POST', '/api/posts', 'two', { ...notice, photo_id })).statusCode,
        422,
      );
      const created = await call('POST', '/api/posts', 'owner', { ...notice, photo_id });
      assert.equal(created.statusCode, 200, created.body);
      assert.equal(
        (await call('GET', '/api/media/' + photo_id, 'two')).headers['content-type'],
        'image/jpeg',
      );
      await call('DELETE', '/api/posts/' + created.json().id, 'owner');
      assert.equal((await call('GET', '/api/media/' + photo_id, 'two')).statusCode, 404);
      assert.equal(
        (
          await call('POST', '/api/media', 'owner', {
            data: Buffer.from('<svg/>').toString('base64'),
          })
        ).statusCode,
        422,
      );
    });
    await t.test('cadastro territorial respeita município e permite reativação', async () => {
      assert.equal(
        (
          await call('PATCH', '/api/admin/neighborhoods/c', 'admin', {
            name: 'Outro bairro',
            active: false,
          })
        ).statusCode,
        403,
      );
      const added = await call('POST', '/api/admin/neighborhoods', 'admin', {
        municipality_id: 'town',
        name: 'Bairro novo',
      });
      assert.equal(added.statusCode, 200, added.body);
      for (const active of [false, true])
        assert.equal(
          (
            await call('PATCH', '/api/admin/neighborhoods/' + added.json().id, 'admin', {
              name: 'Bairro novo',
              active,
            })
          ).statusCode,
          200,
        );
      assert.equal(
        (
          await call('DELETE', '/api/me', 'admin', {
            password: 'test-password-long',
            confirmation: 'EXCLUIR',
          })
        ).statusCode,
        409,
      );
    });
    await t.test('lembretes são únicos e respeitam preferência e cancelamento', async () => {
      const { createReminders } = await import('../src/jobs.js');
      await pool.query('UPDATE accounts SET reminders=false');
      await pool.query(
        "UPDATE posts SET starts_at=now()+interval '2 hours', ends_at=now()+interval '3 hours' WHERE id=$1",
        [eventId],
      );
      await pool.query('UPDATE accounts SET reminders=true WHERE id=$1', [ids.owner]);
      await pool.query(
        'INSERT INTO participations(post_id,account_id) VALUES($1,$2) ON CONFLICT(post_id,account_id) DO UPDATE SET active=true',
        [eventId, ids.owner],
      );
      await createReminders();
      await createReminders();
      const count = await pool.query(
        'SELECT count(*)::int n FROM notifications WHERE account_id=$1 AND dedupe_key IS NOT NULL',
        [ids.owner],
      );
      assert.equal(count.rows[0].n, 1);
      await pool.query(
        "UPDATE posts SET state='cancelado',starts_at=now()+interval '1 hour' WHERE id=$1",
        [eventId],
      );
      assert.equal(await createReminders(), 0);
      await pool.query("UPDATE posts SET state='aberto' WHERE id=$1", [eventId]);
      await pool.query('UPDATE accounts SET reminders=false WHERE id=$1', [ids.owner]);
      assert.equal(await createReminders(), 0);
    });
    await t.test(
      'recuperação usa código único, revoga sessões e permite excluir a conta',
      async () => {
        const known = await call('POST', '/api/auth/forgot', undefined, {
          email: 'new@test.local',
        });
        const unknown = await call('POST', '/api/auth/forgot', undefined, {
          email: 'missing@test.local',
        });
        assert.deepEqual(known.json(), unknown.json());
        assert.equal(known.statusCode, 200);
        const mail = (
          await pool.query(
            "SELECT body FROM mail_outbox WHERE recipient='new@test.local' ORDER BY created_at DESC LIMIT 1",
          )
        ).rows[0];
        const token = mail.body.match(/Código: ([A-Za-z0-9_-]+)/)[1];
        const password = 'new-test-password-long';
        const reset = await call('POST', '/api/auth/reset', undefined, { token, password });
        assert.equal(reset.statusCode, 200, reset.body);
        assert.equal(
          (await call('POST', '/api/auth/reset', undefined, { token, password })).statusCode,
          422,
        );
        assert.equal((await call('GET', '/api/me', 'new')).statusCode, 401);
        const login = await call('POST', '/api/auth/login', undefined, {
          email: 'new@test.local',
          password,
        });
        auth.new = login.json().token;
        assert.equal((await call('POST', '/api/me/verification', 'new')).statusCode, 200);
        const verification = (
          await pool.query(
            "SELECT body FROM mail_outbox WHERE recipient='new@test.local' ORDER BY created_at DESC LIMIT 1",
          )
        ).rows[0].body.match(/Código: ([A-Za-z0-9_-]+)/)[1];
        assert.equal(
          (await call('POST', '/api/me/verification/confirm', 'two', { token: verification }))
            .statusCode,
          422,
        );
        assert.equal(
          (await call('POST', '/api/me/verification/confirm', 'new', { token: verification }))
            .statusCode,
          200,
        );
        const deletion = await call('DELETE', '/api/me', 'new', {
          password,
          confirmation: 'EXCLUIR',
        });
        assert.equal(deletion.statusCode, 200, deletion.body);
        assert.equal((await call('GET', '/api/me', 'new')).statusCode, 401);
        assert.equal(
          (await call('POST', '/api/auth/login', undefined, { email: 'new@test.local', password }))
            .statusCode,
          401,
        );
      },
    );
    await t.test('remoção do autor e logout persistem', async () => {
      assert.equal((await call('DELETE', '/api/posts/' + postId, 'owner')).statusCode, 200);
      assert.equal((await call('GET', '/api/posts/' + postId, 'two')).statusCode, 404);
      const another = await buildApp();
      const r = await another.inject({
        method: 'GET',
        url: '/api/posts/' + eventId,
        headers: { authorization: 'Bearer ' + auth.owner },
      });
      assert.equal(r.statusCode, 200);
      await another.close();
      assert.equal((await call('DELETE', '/api/auth/session', 'one')).statusCode, 200);
      assert.equal((await call('GET', '/api/me', 'one')).statusCode, 401);
    });
  } finally {
    await app.close();
    await pool.end();
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  }
});
