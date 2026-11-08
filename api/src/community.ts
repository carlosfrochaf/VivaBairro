import type { FastifyInstance, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { pool, transaction } from './db.js';
import { HttpError } from './errors.js';
export function registerCommunityRoutes(
  app: FastifyInstance,
  user: (r: FastifyRequest) => NonNullable<FastifyRequest['account']>,
  privileged: (id: string, neighborhood: string, adminOnly?: boolean) => Promise<boolean>,
) {
  app.get('/api/config', async () => ({
    demo: process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production',
    email: process.env.SMTP_HOST
      ? 'smtp'
      : process.env.NODE_ENV === 'production'
        ? 'unavailable'
        : 'local-demo',
    push: 'not-configured',
  }));
  app.get('/api/demo/mail', async (request) => {
    if (
      process.env.DEMO_MODE !== 'true' ||
      process.env.NODE_ENV === 'production' ||
      !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.ip)
    )
      throw new HttpError(404, 'Página não encontrada.');
    const { email } = z
      .object({ email: z.string().email().endsWith('@vivabairro.test') })
      .parse(request.query);
    return {
      items: (
        await pool.query(
          "SELECT subject,body,created_at FROM mail_outbox WHERE recipient=$1 AND created_at>now()-interval '30 minutes' AND EXISTS(SELECT 1 FROM demo_records d WHERE d.kind='account' AND d.record_id=mail_outbox.account_id) ORDER BY created_at DESC LIMIT 5",
          [email],
        )
      ).rows,
    };
  });
  app.get('/api/me/moderation', async (request) => {
    const u = user(request);
    return {
      items: (
        await pool.query(
          "SELECT a.id,a.action,a.reason,a.created_at,p.title,p.id AS post_id,r.body AS reply_body,e.state AS appeal_state FROM audit a JOIN posts p ON p.id=a.post_id LEFT JOIN replies r ON r.id=(a.details->>'reply_id')::uuid LEFT JOIN appeals e ON e.action_id=a.id AND e.author_id=$1 WHERE COALESCE(r.author_id,p.author_id)=$1 AND a.action IN('hide','remove','request-change') ORDER BY a.created_at DESC LIMIT 100",
          [u.id],
        )
      ).rows,
    };
  });
  app.get('/api/admin/territories', async (request) => {
    const u = user(request);
    return {
      municipalities: (
        await pool.query(
          "SELECT m.* FROM municipalities m WHERE EXISTS(SELECT 1 FROM roles r WHERE r.account_id=$1 AND r.role='admin' AND r.revoked_at IS NULL AND r.municipality_id=m.id) ORDER BY m.name",
          [u.id],
        )
      ).rows,
      neighborhoods: (
        await pool.query(
          "SELECT n.* FROM neighborhoods n WHERE EXISTS(SELECT 1 FROM roles r WHERE r.account_id=$1 AND r.role='admin' AND r.revoked_at IS NULL AND r.municipality_id=n.municipality_id) ORDER BY n.name",
          [u.id],
        )
      ).rows,
    };
  });
  app.post('/api/admin/neighborhoods', async (request) => {
    const u = user(request);
    const d = z
      .object({ municipality_id: z.string(), name: z.string().trim().min(2).max(80) })
      .parse(request.body);
    if (
      !(
        await pool.query(
          "SELECT 1 FROM roles WHERE account_id=$1 AND municipality_id=$2 AND role='admin' AND revoked_at IS NULL",
          [u.id, d.municipality_id],
        )
      ).rowCount
    )
      throw new HttpError(403, 'Município fora do seu escopo.');
    const id = randomUUID();
    await transaction(async (db) => {
      await db.query('INSERT INTO neighborhoods(id,municipality_id,name) VALUES($1,$2,$3)', [
        id,
        d.municipality_id,
        d.name,
      ]);
      await db.query(
        'INSERT INTO audit(id,actor_id,action,reason,details) VALUES($1,$2,$3,$4,$5)',
        [
          randomUUID(),
          u.id,
          'create-neighborhood',
          'Bairro cadastrado',
          JSON.stringify({ id, ...d }),
        ],
      );
    });
    return { id };
  });
  app.patch('/api/admin/neighborhoods/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const d = z
      .object({ name: z.string().trim().min(2).max(80), active: z.boolean() })
      .parse(request.body);
    // A consulta inclui bairros inativos, para permitir reativação pelo mesmo município.
    const allowed = await pool.query(
      "SELECT 1 FROM neighborhoods n JOIN roles r ON r.municipality_id=n.municipality_id WHERE n.id=$1 AND r.account_id=$2 AND r.role='admin' AND r.revoked_at IS NULL",
      [id, u.id],
    );
    if (!allowed.rowCount) throw new HttpError(403, 'Bairro fora do seu escopo.');
    await transaction(async (db) => {
      await db.query('UPDATE neighborhoods SET name=$1,active=$2 WHERE id=$3', [
        d.name,
        d.active,
        id,
      ]);
      await db.query(
        'INSERT INTO audit(id,actor_id,action,reason,details) VALUES($1,$2,$3,$4,$5)',
        [
          randomUUID(),
          u.id,
          'update-neighborhood',
          'Cadastro de bairro atualizado',
          JSON.stringify({ id, ...d }),
        ],
      );
    });
    return { ok: true };
  });
  app.patch('/api/admin/municipalities/:id', async (request) => {
    const u = user(request);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { name } = z.object({ name: z.string().trim().min(2).max(100) }).parse(request.body);
    if (
      !(
        await pool.query(
          "SELECT 1 FROM roles WHERE account_id=$1 AND municipality_id=$2 AND role='admin' AND revoked_at IS NULL",
          [u.id, id],
        )
      ).rowCount
    )
      throw new HttpError(403, 'Município fora do seu escopo.');
    await transaction(async (db) => {
      await db.query('UPDATE municipalities SET name=$1 WHERE id=$2', [name, id]);
      await db.query(
        'INSERT INTO audit(id,actor_id,action,reason,details) VALUES($1,$2,$3,$4,$5)',
        [
          randomUUID(),
          u.id,
          'rename-municipality',
          'Nome do município corrigido',
          JSON.stringify({ id, name }),
        ],
      );
    });
    return { ok: true };
  });
  // Mantém a mesma verificação territorial usada pelas rotas existentes.
  void privileged;
}
