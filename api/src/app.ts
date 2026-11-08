import { registerAccountRoutes } from './accounts.js';
import { registerMediaRoutes, validatePhoto } from './media.js';
import { registerCommunityRoutes } from './community.js';
import Fastify, { type FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { pool, transaction } from './db.js';
import { hashPassword, verifyPassword, newToken, tokenHash } from './security.js';

type User = {
  id: string;
  name: string;
  email: string;
  neighborhood_id: string;
  reminders: boolean;
  email_verified_at: string | null;
};
declare module 'fastify' {
  interface FastifyRequest {
    account: User | null;
  }
}
class Problem extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
const uuid = z.string().uuid();
const required = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Use pelo menos ${min} caracteres.`)
    .max(max, `Use no máximo ${max} caracteres.`);
const categories = [
  'infraestrutura',
  'transito',
  'achados-perdidos',
  'utilidade-publica',
  'ajuda',
] as const;
const postInput = z.object({
  kind: z.enum(['event', 'notice', 'official']),
  title: required(5, 80),
  description: required(10, 1000),
  location: required(3, 120),
  neighborhood_id: required(1, 80),
  category: z.enum(categories).default('ajuda'),
  starts_at: z.string().datetime({ offset: true }).nullable().optional(),
  ends_at: z.string().datetime({ offset: true }).nullable().optional(),
  capacity: z.number().int().min(1).max(5000).nullable().optional(),
  issuer: required(2, 100).nullable().optional(),
  photo_id: uuid.nullable().optional(),
});
function user(request: FastifyRequest): User {
  if (!request.account) throw new Problem(401, 'Entre na sua conta para continuar.');
  return request.account;
}
async function territory(id: string) {
  const result = await pool.query('SELECT * FROM neighborhoods WHERE id=$1 AND active', [id]);
  if (!result.rowCount) throw new Problem(422, 'Escolha um bairro disponível.');
  return result.rows[0];
}
async function privileged(accountId: string, neighborhoodId: string, adminOnly = false) {
  const n = await territory(neighborhoodId);
  const r = await pool.query(
    "SELECT 1 FROM roles WHERE account_id=$1 AND municipality_id=$2 AND revoked_at IS NULL AND (role='admin' OR ($4=false AND role='moderator' AND neighborhood_id=$3))",
    [accountId, n.municipality_id, neighborhoodId, adminOnly],
  );
  return !!r.rowCount;
}
function eventDates(data: z.infer<typeof postInput>) {
  if (
    data.kind === 'event' &&
    (!data.starts_at ||
      !data.ends_at ||
      Date.parse(data.starts_at) <= Date.now() ||
      Date.parse(data.ends_at) <= Date.parse(data.starts_at))
  )
    throw new Problem(422, 'Escolha um início futuro e um término depois do início.');
  if (data.kind === 'official' && !data.issuer)
    throw new Problem(422, 'Informe o órgão responsável pelo comunicado.');
}
const selectPosts = `SELECT p.*,a.name AS author_name,n.name AS neighborhood_name,
 (SELECT count(*)::int FROM participations x WHERE x.post_id=p.id AND x.active) AS participants,
 EXISTS(SELECT 1 FROM participations x WHERE x.post_id=p.id AND x.account_id=$1 AND x.active) AS attending
 FROM posts p JOIN accounts a ON a.id=p.author_id JOIN neighborhoods n ON n.id=p.neighborhood_id`;
export async function buildApp() {
  const app = Fastify({ bodyLimit: 24000, logger: false });
  app.decorateRequest('account', null);
  // A prévia web local é ferramenta de desenvolvimento; o aplicativo nativo não usa CORS.
  if (process.env.NODE_ENV !== 'production')
    await app.register(cors, {
      origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  const dummyHash = await hashPassword(newToken());
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError) {
      const fields = Object.fromEntries(error.issues.map((i) => [i.path.join('.'), i.message]));
      return reply.code(422).send({ message: 'Confira os campos indicados.', fields });
    }
    if ((error as { code?: string }).code === '23505')
      return reply
        .code(409)
        .send({ message: 'Não foi possível concluir: esse registro já existe.' });
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    if (status >= 500) request.log.error({ err: error }, 'Falha interna');
    return reply.code(status).send({
      message:
        status >= 500
          ? 'Não foi possível concluir agora. Tente novamente.'
          : (error as Error).message,
    });
  });
  app.addHook('onRequest', async (request) => {
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const r = await pool.query(
        'SELECT a.id,a.name,a.email,a.neighborhood_id,a.reminders,a.email_verified_at FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>now() AND a.deleted_at IS NULL',
        [tokenHash(header.slice(7))],
      );
      request.account = r.rows[0] ?? null;
    }
  });
  app.get('/health', async () => {
    await pool.query('SELECT 1');
    return { ok: true };
  });
  app.get('/api/neighborhoods', async () => ({
    items: (
      await pool.query(
        'SELECT n.*,m.name AS municipality_name FROM neighborhoods n JOIN municipalities m ON m.id=n.municipality_id WHERE n.active ORDER BY n.name',
      )
    ).rows,
    categories,
  }));
  async function session(accountId: string) {
    const token = newToken();
    await pool.query(
      "INSERT INTO sessions(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
      [tokenHash(token), accountId],
    );
    return { token };
  }
  app.post(
    '/api/auth/register',
    { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
    async (request) => {
      const d = z
        .object({
          name: required(2, 60),
          email: z
            .string()
            .trim()
            .email()
            .max(254)
            .transform((v) => v.toLowerCase()),
          password: z.string().min(12, 'Use pelo menos 12 caracteres.').max(128),
          neighborhood_id: required(1, 80),
        })
        .parse(request.body);
      await territory(d.neighborhood_id);
      const id = randomUUID();
      const hash = await hashPassword(d.password);
      await pool.query(
        'INSERT INTO accounts(id,name,email,password_hash,neighborhood_id) VALUES($1,$2,$3,$4,$5)',
        [id, d.name, d.email, hash, d.neighborhood_id],
      );
      return session(id);
    },
  );
  app.post(
    '/api/auth/login',
    { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
    async (request) => {
      const d = z
        .object({
          email: z
            .string()
            .trim()
            .email()
            .max(254)
            .transform((v) => v.toLowerCase()),
          password: z.string().min(1).max(128),
        })
        .parse(request.body);
      const r = await pool.query(
        'SELECT id,password_hash FROM accounts WHERE email=$1 AND deleted_at IS NULL',
        [d.email],
      );
      const valid = await verifyPassword(d.password, r.rows[0]?.password_hash ?? dummyHash);
      if (!r.rowCount || !valid)
        throw new Problem(401, 'E-mail ou senha incorretos. Confira e tente novamente.');
      return session(r.rows[0].id);
    },
  );
  app.delete('/api/auth/session', async (request) => {
    user(request);
    await pool.query('DELETE FROM sessions WHERE token_hash=$1', [
      tokenHash(request.headers.authorization!.slice(7)),
    ]);
    return { ok: true };
  });
  app.get('/api/me', async (request) => {
    const u = user(request);
    return {
      ...u,
      roles: (
        await pool.query(
          'SELECT role,municipality_id,neighborhood_id FROM roles WHERE account_id=$1 AND revoked_at IS NULL',
          [u.id],
        )
      ).rows,
      follows: (
        await pool.query('SELECT neighborhood_id FROM follows WHERE account_id=$1', [u.id])
      ).rows.map((r) => r.neighborhood_id),
    };
  });
  app.patch('/api/me', async (request) => {
    const u = user(request);
    const d = z
      .object({
        name: required(2, 60),
        neighborhood_id: required(1, 80),
        reminders: z.boolean(),
        follows: z.array(z.string()).max(5),
      })
      .parse(request.body);
    const main = await territory(d.neighborhood_id);
    for (const id of d.follows) {
      const n = await territory(id);
      if (n.municipality_id !== main.municipality_id)
        throw new Problem(422, 'Escolha bairros do mesmo município.');
    }
    await transaction(async (db) => {
      await db.query('UPDATE accounts SET name=$1,neighborhood_id=$2,reminders=$3 WHERE id=$4', [
        d.name,
        d.neighborhood_id,
        d.reminders,
        u.id,
      ]);
      await db.query('DELETE FROM follows WHERE account_id=$1', [u.id]);
      for (const id of new Set(d.follows.filter((id) => id !== d.neighborhood_id)))
        await db.query('INSERT INTO follows VALUES($1,$2)', [u.id, id]);
    });
    return { ok: true };
  });
  app.get('/api/posts', async (request) => {
    const u = user(request);
    const q = z
      .object({
        neighborhood: z.string().optional(),
        from: z.string().datetime({ offset: true }).optional(),
        to: z.string().datetime({ offset: true }).optional(),
        q: z.string().max(100).default(''),
        kind: z.enum(['event', 'notice', 'official']).optional(),
        category: z.enum(categories).optional(),
        mine: z.enum(['true']).optional(),
        attending: z.enum(['true']).optional(),
        offset: z.coerce.number().int().min(0).max(100000).default(0),
      })
      .parse(request.query);
    if (q.from && q.to && new Date(q.from) >= new Date(q.to))
      throw new Problem(422, 'O fim do período deve ser posterior ao início.');
    const r = await pool.query(
      selectPosts +
        ` WHERE (p.visibility='visible' OR p.author_id=$1) AND ($2::text IS NULL OR p.neighborhood_id=$2 OR ($2='followed' AND (p.neighborhood_id=(SELECT neighborhood_id FROM accounts WHERE id=$1) OR EXISTS(SELECT 1 FROM follows WHERE account_id=$1 AND neighborhood_id=p.neighborhood_id)))) AND ($3::text IS NULL OR p.kind=$3) AND (p.title ILIKE $4 OR p.description ILIKE $4 OR p.location ILIKE $4) AND ($5::text IS NULL OR p.category=$5) AND ($6::boolean=false OR p.author_id=$1) AND ($7::boolean=false OR EXISTS(SELECT 1 FROM participations x WHERE x.post_id=p.id AND x.account_id=$1 AND x.active)) AND ($9::timestamptz IS NULL OR COALESCE(p.starts_at,p.created_at)>=$9) AND ($10::timestamptz IS NULL OR COALESCE(p.starts_at,p.created_at)<$10) ORDER BY p.created_at DESC,p.id LIMIT 21 OFFSET $8`,
      [
        u.id,
        q.neighborhood ?? null,
        q.kind ?? null,
        '%' + q.q + '%',
        q.category ?? null,
        !!q.mine,
        !!q.attending,
        q.offset,
        q.from ?? null,
        q.to ?? null,
      ],
    );
    return { items: r.rows.slice(0, 20), hasMore: r.rows.length > 20 };
  });
  app.get('/api/posts/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const r = await pool.query(selectPosts + ' WHERE p.id=$2', [u.id, id]);
    const p = r.rows[0];
    if (!p) throw new Problem(404, 'Publicação não encontrada.');
    if (
      p.visibility !== 'visible' &&
      p.author_id !== u.id &&
      !(await privileged(u.id, p.neighborhood_id))
    )
      throw new Problem(404, 'Publicação indisponível.');
    return {
      ...p,
      replies: (
        await pool.query(
          "SELECT r.id,r.body,r.author_id,r.created_at,a.name AS author_name FROM replies r JOIN accounts a ON a.id=r.author_id WHERE r.post_id=$1 AND r.visibility='visible' ORDER BY r.created_at LIMIT 100",
          [id],
        )
      ).rows,
      history: (
        await pool.query(
          'SELECT id,action,reason,created_at FROM audit WHERE post_id=$1 ORDER BY created_at DESC LIMIT 30',
          [id],
        )
      ).rows,
    };
  });
  app.post('/api/posts', async (request) => {
    const u = user(request);
    const d = postInput.parse(request.body);
    await territory(d.neighborhood_id);
    eventDates(d);
    await validatePhoto(d.photo_id, u.id);
    if (d.kind === 'official' && !(await privileged(u.id, d.neighborhood_id, true)))
      throw new Problem(403, 'Somente a administração municipal pode publicar comunicados.');
    const id = randomUUID();
    await pool.query(
      'INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,category,starts_at,ends_at,capacity,issuer,photo_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      [
        id,
        u.id,
        d.neighborhood_id,
        d.kind,
        d.title,
        d.description,
        d.location,
        d.category,
        d.kind === 'event' ? d.starts_at : null,
        d.kind === 'event' ? d.ends_at : null,
        d.kind === 'event' ? d.capacity : null,
        d.kind === 'official' ? d.issuer : null,
        d.photo_id ?? null,
      ],
    );
    return { id };
  });
  app.put('/api/posts/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const d = postInput.parse(request.body);
    await territory(d.neighborhood_id);
    eventDates(d);
    await validatePhoto(d.photo_id, u.id);
    await transaction(async (db) => {
      const r = await db.query('SELECT * FROM posts WHERE id=$1 FOR UPDATE', [id]);
      const p = r.rows[0];
      if (!p) throw new Problem(404, 'Publicação não encontrada.');
      if (p.author_id !== u.id) throw new Problem(403, 'Somente o autor pode editar.');
      if (p.kind !== d.kind || p.visibility !== 'visible')
        throw new Problem(409, 'Essa publicação não pode ser editada agora.');
      if (d.kind === 'official' && !(await privileged(u.id, d.neighborhood_id, true)))
        throw new Problem(403, 'Município fora do seu escopo.');
      const count = await db.query(
        'SELECT count(*)::int AS total FROM participations WHERE post_id=$1 AND active',
        [id],
      );
      if (d.capacity && d.capacity < count.rows[0].total)
        throw new Problem(409, 'A capacidade não pode ser menor que as presenças confirmadas.');
      await db.query(
        'UPDATE posts SET title=$1,description=$2,location=$3,neighborhood_id=$4,category=$5,starts_at=$6,ends_at=$7,capacity=$8,issuer=$9,photo_id=$11,updated_at=now() WHERE id=$10',
        [
          d.title,
          d.description,
          d.location,
          d.neighborhood_id,
          d.category,
          d.kind === 'event' ? d.starts_at : null,
          d.kind === 'event' ? d.ends_at : null,
          d.kind === 'event' ? d.capacity : null,
          d.issuer ?? null,
          id,
          d.photo_id === undefined ? p.photo_id : d.photo_id,
        ],
      );
      await db.query(
        'INSERT INTO audit(id,actor_id,post_id,action,reason,details) VALUES($1,$2,$3,$4,$5,$6)',
        [
          randomUUID(),
          u.id,
          id,
          'edit',
          'Publicação atualizada pelo autor',
          JSON.stringify({ previous: p }),
        ],
      );
      await db.query(
        "INSERT INTO notifications(id,account_id,post_id,message) SELECT gen_random_uuid(),account_id,$1,'Informações do evento foram atualizadas: ' || $2 FROM participations WHERE post_id=$1 AND active",
        [id, d.title],
      );
    });
    return { ok: true };
  });
  app.patch('/api/posts/:id/state', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const d = z
      .object({ state: z.enum(['aberto', 'em-andamento', 'resolvido', 'encerrado', 'cancelado']) })
      .parse(request.body);
    await transaction(async (db) => {
      const r = await db.query('SELECT * FROM posts WHERE id=$1 FOR UPDATE', [id]);
      const p = r.rows[0];
      if (!p) throw new Problem(404, 'Publicação não encontrada.');
      if (p.author_id !== u.id) throw new Problem(403, 'Somente o autor pode atualizar o estado.');
      const transitions: Record<string, string[]> = {
        aberto: ['em-andamento', 'resolvido', 'encerrado'],
        'em-andamento': ['aberto', 'resolvido', 'encerrado'],
        resolvido: ['aberto'],
        encerrado: ['aberto'],
      };
      if (
        p.kind === 'event'
          ? d.state !== 'cancelado' || p.state === 'cancelado'
          : !transitions[p.state]?.includes(d.state)
      )
        throw new Problem(409, 'Essa mudança de estado não está disponível.');
      await db.query('UPDATE posts SET state=$1,updated_at=now() WHERE id=$2', [d.state, id]);
      await db.query(
        'INSERT INTO audit(id,actor_id,post_id,action,reason) VALUES($1,$2,$3,$4,$5)',
        [randomUUID(), u.id, id, 'state', 'Estado alterado pelo autor: ' + d.state],
      );
      if (p.kind === 'event')
        await db.query(
          "INSERT INTO notifications(id,account_id,post_id,message) SELECT gen_random_uuid(),account_id,$1,'Evento cancelado: ' || $2 FROM participations WHERE post_id=$1 AND active",
          [id, p.title],
        );
    });
    return { ok: true };
  });
  app.post('/api/posts/:id/attendance', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    await transaction(async (db) => {
      const r = await db.query('SELECT * FROM posts WHERE id=$1 FOR UPDATE', [id]);
      const p = r.rows[0];
      if (!p || p.kind !== 'event') throw new Problem(404, 'Evento não encontrado.');
      if (
        p.visibility !== 'visible' ||
        p.state === 'cancelado' ||
        new Date(p.starts_at) <= new Date()
      )
        throw new Problem(409, 'Este evento não aceita inscrições.');
      if (
        (
          await db.query(
            'SELECT 1 FROM participations WHERE post_id=$1 AND account_id=$2 AND active',
            [id, u.id],
          )
        ).rowCount
      )
        return;
      const count = await db.query(
        'SELECT count(*)::int AS total FROM participations WHERE post_id=$1 AND active',
        [id],
      );
      if (p.capacity !== null && count.rows[0].total >= p.capacity)
        throw new Problem(409, 'Não há mais vagas neste evento.');
      await db.query(
        'INSERT INTO participations(post_id,account_id) VALUES($1,$2) ON CONFLICT(post_id,account_id) DO UPDATE SET active=true,updated_at=now()',
        [id, u.id],
      );
    });
    return { ok: true };
  });
  app.delete('/api/posts/:id/attendance', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    await pool.query(
      'UPDATE participations SET active=false,updated_at=now() WHERE post_id=$1 AND account_id=$2',
      [id, u.id],
    );
    return { ok: true };
  });
  app.post('/api/posts/:id/replies', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const d = z.object({ body: required(2, 1000) }).parse(request.body);
    await transaction(async (db) => {
      const r = await db.query(
        "SELECT * FROM posts WHERE id=$1 AND visibility='visible' FOR UPDATE",
        [id],
      );
      const p = r.rows[0];
      if (!p || p.kind !== 'notice') throw new Problem(404, 'Aviso indisponível.');
      await db.query('INSERT INTO replies(id,post_id,author_id,body) VALUES($1,$2,$3,$4)', [
        randomUUID(),
        id,
        u.id,
        d.body,
      ]);
      if (p.author_id !== u.id)
        await db.query(
          'INSERT INTO notifications(id,account_id,post_id,message) VALUES($1,$2,$3,$4)',
          [randomUUID(), p.author_id, id, 'Nova resposta no aviso: ' + p.title],
        );
    });
    return { ok: true };
  });
  app.post('/api/posts/:id/reports', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const d = z.object({ reason: required(5, 500), reply_id: uuid.optional() }).parse(request.body);
    if (
      !(await pool.query("SELECT 1 FROM posts WHERE id=$1 AND visibility='visible'", [id])).rowCount
    )
      throw new Problem(404, 'Publicação indisponível.');
    if (
      d.reply_id &&
      !(await pool.query('SELECT 1 FROM replies WHERE id=$1 AND post_id=$2', [d.reply_id, id]))
        .rowCount
    )
      throw new Problem(422, 'Resposta inválida.');
    await pool.query(
      'INSERT INTO reports(id,post_id,reply_id,reporter_id,reason) VALUES($1,$2,$3,$4,$5)',
      [randomUUID(), id, d.reply_id ?? null, u.id, d.reason],
    );
    return { ok: true };
  });
  app.get('/api/notifications', async (request) => ({
    items: (
      await pool.query(
        'SELECT * FROM notifications WHERE account_id=$1 ORDER BY created_at DESC LIMIT 100',
        [user(request).id],
      )
    ).rows,
  }));
  app.patch('/api/notifications/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    await pool.query('UPDATE notifications SET read_at=now() WHERE id=$1 AND account_id=$2', [
      id,
      u.id,
    ]);
    return { ok: true };
  });
  app.get('/api/moderation', async (request) => {
    const u = user(request);
    return {
      items: (
        await pool.query(
          "SELECT r.id,r.post_id,r.reply_id,r.reason,r.created_at,p.title,n.name AS neighborhood_name,(SELECT body FROM replies WHERE id=r.reply_id) AS reply_body FROM reports r JOIN posts p ON p.id=r.post_id JOIN neighborhoods n ON n.id=p.neighborhood_id WHERE r.state='open' AND EXISTS(SELECT 1 FROM roles x WHERE x.account_id=$1 AND x.revoked_at IS NULL AND x.municipality_id=n.municipality_id AND (x.role='admin' OR x.neighborhood_id=n.id)) ORDER BY r.created_at LIMIT 100",
          [u.id],
        )
      ).rows,
    };
  });
  app.post('/api/moderation/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const d = z
      .object({
        action: z.enum(['keep', 'hide', 'remove', 'restore', 'request-change']),
        reason: required(5, 500),
      })
      .parse(request.body);
    await transaction(async (db) => {
      const r = await db.query(
        'SELECT r.*,p.author_id,p.neighborhood_id FROM reports r JOIN posts p ON p.id=r.post_id WHERE r.id=$1 FOR UPDATE OF r,p',
        [id],
      );
      const report = r.rows[0];
      if (!report) throw new Problem(404, 'Denúncia não encontrada.');
      if (!(await privileged(u.id, report.neighborhood_id)))
        throw new Problem(403, 'Este bairro não está no seu escopo.');
      const recipient = report.reply_id
        ? (await db.query('SELECT author_id FROM replies WHERE id=$1', [report.reply_id])).rows[0]
            .author_id
        : report.author_id;
      if (report.state !== 'open') throw new Problem(409, 'Essa denúncia já foi analisada.');
      if (recipient === u.id)
        throw new Problem(403, 'Encaminhe a análise do seu próprio conteúdo a outra pessoa.');
      const visibility = { hide: 'hidden', remove: 'removed', restore: 'visible' }[
        d.action as 'hide' | 'remove' | 'restore'
      ];
      if (visibility) {
        if (report.reply_id)
          await db.query('UPDATE replies SET visibility=$1 WHERE id=$2', [
            visibility,
            report.reply_id,
          ]);
        else
          await db.query('UPDATE posts SET visibility=$1 WHERE id=$2', [
            visibility,
            report.post_id,
          ]);
      }
      await db.query("UPDATE reports SET state='reviewed' WHERE id=$1", [id]);
      await db.query(
        'INSERT INTO audit(id,actor_id,post_id,action,reason,details) VALUES($1,$2,$3,$4,$5,$6)',
        [
          randomUUID(),
          u.id,
          report.post_id,
          d.action,
          d.reason,
          JSON.stringify({ report_id: id, reply_id: report.reply_id }),
        ],
      );
      await db.query(
        'INSERT INTO notifications(id,account_id,post_id,message) VALUES($1,$2,$3,$4)',
        [
          randomUUID(),
          recipient,
          report.post_id,
          'Decisão de moderação (' + d.action + '): ' + d.reason,
        ],
      );
    });
    return { ok: true };
  });
  app.post('/api/appeals', async (request) => {
    const u = user(request);
    const d = z.object({ action_id: uuid, reason: required(5, 500) }).parse(request.body);
    const r = await pool.query(
      `SELECT a.*,COALESCE(r.author_id,p.author_id) AS author_id FROM audit a JOIN posts p ON p.id=a.post_id LEFT JOIN replies r ON r.id=(a.details->>'reply_id')::uuid WHERE a.id=$1`,
      [d.action_id],
    );
    if (
      !r.rowCount ||
      r.rows[0].author_id !== u.id ||
      !['hide', 'remove', 'request-change'].includes(r.rows[0].action)
    )
      throw new Problem(403, 'Não é possível pedir revisão dessa ação.');
    await pool.query('INSERT INTO appeals(id,action_id,author_id,reason) VALUES($1,$2,$3,$4)', [
      randomUUID(),
      d.action_id,
      u.id,
      d.reason,
    ]);
    return { ok: true };
  });
  app.post('/api/admin/moderators', async (request) => {
    const u = user(request);
    const d = z
      .object({
        email: z
          .string()
          .email()
          .transform((v) => v.toLowerCase()),
        neighborhood_id: z.string(),
        revoke: z.boolean().default(false),
      })
      .parse(request.body);
    const n = await territory(d.neighborhood_id);
    if (!(await privileged(u.id, n.id, true)))
      throw new Problem(403, 'Você não administra este município.');
    const account = (await pool.query('SELECT id FROM accounts WHERE email=$1', [d.email])).rows[0];
    if (!account) throw new Problem(404, 'Conta não encontrada.');
    await transaction(async (db) => {
      if (d.revoke)
        await db.query(
          "UPDATE roles SET revoked_at=now() WHERE account_id=$1 AND neighborhood_id=$2 AND role='moderator' AND revoked_at IS NULL",
          [account.id, n.id],
        );
      else
        await db.query(
          "INSERT INTO roles(id,account_id,municipality_id,neighborhood_id,role,granted_by) VALUES($1,$2,$3,$4,'moderator',$5) ON CONFLICT DO NOTHING",
          [randomUUID(), account.id, n.municipality_id, n.id, u.id],
        );
      await db.query(
        'INSERT INTO audit(id,actor_id,action,reason,details) VALUES($1,$2,$3,$4,$5)',
        [
          randomUUID(),
          u.id,
          d.revoke ? 'revoke-role' : 'grant-role',
          'Designação territorial',
          JSON.stringify({ account_id: account.id, neighborhood_id: n.id }),
        ],
      );
    });
    return { ok: true };
  });
  app.post('/api/ai/suggestion', async (request, reply) => {
    user(request);
    return reply.code(503).send({
      message: 'Assistência de IA ainda não configurada. Você pode publicar manualmente.',
    });
  });
  app.delete('/api/posts/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    await transaction(async (db) => {
      const p = (await db.query('SELECT * FROM posts WHERE id=$1 FOR UPDATE', [id])).rows[0];
      if (!p) throw new Problem(404, 'Publicação não encontrada.');
      if (p.author_id !== u.id) throw new Problem(403, 'Somente o autor pode remover.');
      if (p.visibility === 'removed') return;
      await db.query("UPDATE posts SET visibility='removed',updated_at=now() WHERE id=$1", [id]);
      await db.query(
        'INSERT INTO audit(id,actor_id,post_id,action,reason) VALUES($1,$2,$3,$4,$5)',
        [randomUUID(), u.id, id, 'author-remove', 'Publicação removida pelo autor.'],
      );
      await db.query(
        "INSERT INTO notifications(id,account_id,post_id,message) SELECT gen_random_uuid(),account_id,$1,'Evento removido pelo responsável: ' || $2 FROM participations WHERE post_id=$1 AND active",
        [id, p.title],
      );
    });
    return { ok: true };
  });
  app.get('/api/admin/moderators', async (request) => {
    const u = user(request);
    return {
      items: (
        await pool.query(
          "SELECT a.name,a.email,r.neighborhood_id,n.name AS neighborhood_name FROM roles r JOIN accounts a ON a.id=r.account_id JOIN neighborhoods n ON n.id=r.neighborhood_id WHERE r.role='moderator' AND r.revoked_at IS NULL AND EXISTS(SELECT 1 FROM roles x WHERE x.account_id=$1 AND x.role='admin' AND x.revoked_at IS NULL AND x.municipality_id=r.municipality_id) ORDER BY n.name,a.name",
          [u.id],
        )
      ).rows,
    };
  });
  app.get('/api/moderation/appeals', async (request) => {
    const u = user(request);
    return {
      items: (
        await pool.query(
          "SELECT e.id,e.reason,e.created_at,p.id AS post_id,p.title,a.reason AS original_reason FROM appeals e JOIN audit a ON a.id=e.action_id JOIN posts p ON p.id=a.post_id JOIN neighborhoods n ON n.id=p.neighborhood_id WHERE e.state='open' AND EXISTS(SELECT 1 FROM roles r WHERE r.account_id=$1 AND r.revoked_at IS NULL AND r.municipality_id=n.municipality_id AND (r.role='admin' OR r.neighborhood_id=n.id)) ORDER BY e.created_at LIMIT 100",
          [u.id],
        )
      ).rows,
    };
  });
  app.post('/api/moderation/appeals/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const d = z
      .object({ action: z.enum(['restore', 'keep']), reason: required(5, 500) })
      .parse(request.body);
    await transaction(async (db) => {
      const e = (
        await db.query(
          'SELECT e.*,a.actor_id AS original_actor,a.post_id,a.details,p.neighborhood_id FROM appeals e JOIN audit a ON a.id=e.action_id JOIN posts p ON p.id=a.post_id WHERE e.id=$1 FOR UPDATE OF e,p',
          [id],
        )
      ).rows[0];
      if (!e) throw new Problem(404, 'Pedido não encontrado.');
      if (!(await privileged(u.id, e.neighborhood_id)))
        throw new Problem(403, 'Bairro fora do seu escopo.');
      if (e.author_id === u.id || e.original_actor === u.id)
        throw new Problem(403, 'Outra pessoa deve revisar essa decisão.');
      if (e.state !== 'open') throw new Problem(409, 'Esse pedido já foi analisado.');
      if (d.action === 'restore') {
        const target = e.details.reply_id;
        const newer = await db.query(
          "SELECT 1 FROM audit WHERE post_id=$1 AND created_at>(SELECT created_at FROM audit WHERE id=$2) AND (action='author-remove' OR (action IN ('hide','remove','restore') AND (details->>'reply_id') IS NOT DISTINCT FROM $3::text))",
          [e.post_id, e.action_id, target ?? null],
        );
        if (newer.rowCount)
          throw new Problem(
            409,
            'Há uma decisão mais recente. Analise o histórico antes de restaurar.',
          );
        if (target) await db.query("UPDATE replies SET visibility='visible' WHERE id=$1", [target]);
        else
          await db.query("UPDATE posts SET visibility='visible',updated_at=now() WHERE id=$1", [
            e.post_id,
          ]);
      }
      await db.query("UPDATE appeals SET state='reviewed' WHERE id=$1", [id]);
      await db.query(
        'INSERT INTO audit(id,actor_id,post_id,action,reason,details) VALUES($1,$2,$3,$4,$5,$6)',
        [
          randomUUID(),
          u.id,
          e.post_id,
          d.action === 'restore' ? 'restore' : 'appeal-kept',
          d.reason,
          JSON.stringify({ appeal_id: id, reply_id: e.details.reply_id ?? null }),
        ],
      );
      await db.query(
        'INSERT INTO notifications(id,account_id,post_id,message) VALUES($1,$2,$3,$4)',
        [randomUUID(), e.author_id, e.post_id, 'Pedido de revisão analisado: ' + d.reason],
      );
    });
    return { ok: true };
  });
  app.get('/api/me/overview', async (request) => {
    const u = user(request);
    const counts = (
      await pool.query(
        `SELECT
      (SELECT count(*)::int FROM participations x JOIN posts p ON p.id=x.post_id WHERE x.account_id=$1 AND x.active AND p.visibility='visible' AND p.state<>'cancelado' AND p.ends_at>now()) AS activities,
      (SELECT count(*)::int FROM posts WHERE author_id=$1 AND kind='notice' AND visibility='visible') AS notices,
      1+(SELECT count(*)::int FROM follows WHERE account_id=$1) AS neighborhoods`,
        [u.id],
      )
    ).rows[0];
    const activities = (
      await pool.query(
        selectPosts +
          ` WHERE p.kind='event' AND p.visibility='visible' AND p.state<>'cancelado' AND p.ends_at>now() AND EXISTS(SELECT 1 FROM participations x WHERE x.post_id=p.id AND x.account_id=$1 AND x.active) ORDER BY p.starts_at LIMIT 3`,
        [u.id],
      )
    ).rows;
    const notices = (
      await pool.query(
        selectPosts +
          ` WHERE p.author_id=$1 AND p.kind='notice' AND p.visibility='visible' ORDER BY p.created_at DESC LIMIT 3`,
        [u.id],
      )
    ).rows;
    return { counts, activities, notices };
  });
  registerAccountRoutes(app, user);
  registerMediaRoutes(app, user);
  registerCommunityRoutes(app, user, privileged);
  return app;
}
