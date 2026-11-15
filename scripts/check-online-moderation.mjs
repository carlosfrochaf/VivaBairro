// Usa somente contas descartáveis previamente criadas; nunca recebe credenciais pelo CLI.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file = new URL('../.local/moderation-online-private.json', import.meta.url);
const s = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(s.base, 'https://vivabairro-api.onrender.com');
const save = () => fs.writeFileSync(file, JSON.stringify(s, null, 2));
async function call(who, method, path, body, expected = 200) {
  const response = await fetch(s.base + path, {
    method,
    headers: {
      ...(who ? { Authorization: 'Bearer ' + s.accounts[who].token } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  assert.equal(response.status, expected, method + ' ' + path + ': ' + JSON.stringify(data));
  return data;
}
const check = (label) => {
  s.checks.push(label);
  save();
  console.log('OK: ' + label);
};
async function post(who, area = 'centro', kind = 'notice') {
  const d = {
    kind,
    title: 'Teste de moderação ' + s.run,
    description: 'Conteúdo fictício e descartável para revisão técnica.',
    location: 'Local fictício de teste',
    neighborhood_id: area,
  };
  if (kind === 'event')
    Object.assign(d, {
      starts_at: new Date(Date.now() + 86400000).toISOString(),
      ends_at: new Date(Date.now() + 90000000).toISOString(),
      capacity: 10,
    });
  const p = await call(who, 'POST', '/api/posts', d);
  s.posts.push({ id: p.id, owner: who });
  save();
  return p.id;
}
async function report(id, reply_id) {
  await call('reporter', 'POST', '/api/posts/' + id + '/reports', {
    reason: 'Denúncia fictícia para teste técnico.',
    ...(reply_id ? { reply_id } : {}),
  });
  const q = await call('moderator', 'GET', '/api/moderation');
  assert.ok(q.items.every((x) => !('reporter_id' in x)));
  const found = q.items.find(
    (x) => x.post_id === id && (reply_id ? x.reply_id === reply_id : !x.reply_id),
  );
  assert.ok(found);
  return found.id;
}
if (process.argv.includes('--run')) {
  await call(null, 'GET', '/api/moderation', null, 401);
  for (const who of ['moderator', 'reviewer'])
    assert.ok(
      (await call(who, 'GET', '/api/me')).roles.some(
        (r) => r.role === 'moderator' && r.neighborhood_id === 'centro',
      ),
    );
  for (const action of ['keep', 'request-change', 'hide', 'remove']) {
    const id = await post('owner', 'centro', action === 'hide' ? 'event' : 'notice');
    const rid = await report(id);
    await call('reporter', 'GET', '/api/posts/' + id);
    await call(
      'owner',
      'POST',
      '/api/moderation/' + rid,
      { action, reason: 'Tentativa sem permissão.' },
      403,
    );
    await call('moderator', 'POST', '/api/moderation/' + rid, { action, reason: 'x' }, 422);
    await call('moderator', 'POST', '/api/moderation/' + rid, {
      action,
      reason: 'Justificativa do teste ' + action + '.',
    });
    await call(
      'reporter',
      'GET',
      '/api/posts/' + id,
      null,
      ['hide', 'remove'].includes(action) ? 404 : 200,
    );
    const n = (await call('owner', 'GET', '/api/notifications')).items.find(
      (x) => x.post_id === id,
    );
    assert.ok(n);
    assert.ok(!n.message.includes('Decisão de moderação ('));
    assert.ok(n.message.includes('Motivo:'));
    await call(
      'moderator',
      'POST',
      '/api/moderation/' + rid,
      { action, reason: 'Tentativa duplicada.' },
      409,
    );
    if (action !== 'keep') {
      const audit = (await call('owner', 'GET', '/api/me/moderation')).items.find(
        (x) => x.post_id === id,
      );
      assert.ok(audit);
      await call('owner', 'POST', '/api/appeals', {
        action_id: audit.id,
        reason: 'Pedido fictício de revisão.',
      });
      await call(
        'owner',
        'POST',
        '/api/appeals',
        { action_id: audit.id, reason: 'Pedido fictício duplicado.' },
        409,
      );
      const appeal = (await call('reviewer', 'GET', '/api/moderation/appeals')).items.find(
        (x) => x.post_id === id,
      );
      assert.ok(appeal);
      await call(
        'moderator',
        'POST',
        '/api/moderation/appeals/' + appeal.id,
        { action: 'restore', reason: 'Não pode revisar a própria decisão.' },
        403,
      );
      const outcome = action === 'remove' ? 'keep' : 'restore';
      await call('reviewer', 'POST', '/api/moderation/appeals/' + appeal.id, {
        action: outcome,
        reason: 'Revisão independente de teste.',
      });
      await call(
        'reporter',
        'GET',
        '/api/posts/' + id,
        null,
        outcome === 'keep' && action === 'remove' ? 404 : 200,
      );
    }
    check('Decisão ' + action + ' com notificações e autorização');
  }
  const outside = await post('owner', 'aurora');
  await call('reporter', 'POST', '/api/posts/' + outside + '/reports', {
    reason: 'Teste fora do bairro atribuído.',
  });
  assert.ok(
    !(await call('moderator', 'GET', '/api/moderation')).items.some((x) => x.post_id === outside),
  );
  const self = await post('moderator');
  const ownReport = await report(self);
  await call(
    'moderator',
    'POST',
    '/api/moderation/' + ownReport,
    { action: 'remove', reason: 'Teste de conflito de autoria.' },
    403,
  );
  await call('reviewer', 'POST', '/api/moderation/' + ownReport, {
    action: 'keep',
    reason: 'Conteúdo de teste mantido.',
  });
  check('Filtro territorial e conflito de autoria');
  const parent = await post('owner');
  await call('reporter', 'POST', '/api/posts/' + parent + '/replies', {
    body: 'Resposta fictícia para teste de moderação.',
  });
  const reply = (await call('owner', 'GET', '/api/posts/' + parent)).replies[0];
  const reportId = await report(parent, reply.id);
  await call('moderator', 'POST', '/api/moderation/' + reportId, {
    action: 'remove',
    reason: 'Remoção de resposta fictícia.',
  });
  assert.equal((await call('owner', 'GET', '/api/posts/' + parent)).replies.length, 0);
  const decision = (await call('reporter', 'GET', '/api/me/moderation')).items.find(
    (x) => x.post_id === parent,
  );
  assert.ok(decision);
  await call(
    'owner',
    'POST',
    '/api/appeals',
    { action_id: decision.id, reason: 'Autor da publicação não é autor da resposta.' },
    403,
  );
  await call('reporter', 'POST', '/api/appeals', {
    action_id: decision.id,
    reason: 'Revisão da resposta fictícia.',
  });
  const appeal = (await call('reviewer', 'GET', '/api/moderation/appeals')).items.find(
    (x) => x.post_id === parent,
  );
  await call('reviewer', 'POST', '/api/moderation/appeals/' + appeal.id, {
    action: 'restore',
    reason: 'Resposta fictícia restaurada.',
  });
  assert.equal((await call('owner', 'GET', '/api/posts/' + parent)).replies.length, 1);
  check('Resposta removida e restaurada por recurso do autor correto');
  const pending = await post('owner');
  s.pendingReport = await report(pending);
  save();
} else if (process.argv.includes('--revoked')) {
  for (const who of ['moderator', 'reviewer']) {
    assert.equal((await call(who, 'GET', '/api/me')).roles.length, 0);
    await call(
      who,
      'POST',
      '/api/moderation/' + s.pendingReport,
      { action: 'remove', reason: 'Tentativa após revogação de teste.' },
      403,
    );
  }
  check('Revogação impede ações mesmo com sessão ainda aberta');
} else if (process.argv.includes('--cleanup')) {
  for (const [who, a] of Object.entries(s.accounts)) {
    if (a.closed) continue;
    await call(who, 'DELETE', '/api/me', { password: a.password, confirmation: 'EXCLUIR' });
    a.closed = true;
    delete a.password;
    delete a.token;
    save();
  }
  check('Contas de teste encerradas e credenciais descartadas');
} else throw Error('Use --run, --revoked ou --cleanup após conferir o ambiente e as permissões.');
