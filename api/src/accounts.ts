import type { FastifyInstance, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { PoolClient } from 'pg';
import { transaction } from './db.js';
import { hashPassword, newToken, tokenHash, verifyPassword } from './security.js';
import { HttpError } from './errors.js';

export async function issueAccountToken(
  db: PoolClient,
  id: string,
  email: string,
  purpose: 'reset' | 'verify',
) {
  await db.query('SELECT id FROM accounts WHERE id=$1 FOR UPDATE', [id]);
  await db.query(
    'UPDATE account_tokens SET used_at=now() WHERE account_id=$1 AND purpose=$2 AND used_at IS NULL',
    [id, purpose],
  );
  const token = newToken();
  await db.query("INSERT INTO account_tokens VALUES($1,$2,$3,now()+interval '30 minutes',NULL)", [
    tokenHash(token),
    id,
    purpose,
  ]);
  const subject =
    purpose === 'reset' ? 'Redefinir sua senha — VivaBairro' : 'Confirmar seu e-mail — VivaBairro';
  const body = `${purpose === 'reset' ? 'Para redefinir sua senha, abra Esqueci minha senha e toque em Já tenho um código.' : 'Para confirmar o e-mail, abra Segurança da conta e informe o código.'}\n\nCódigo: ${token}\n\nVálido por 30 minutos, para uma única utilização. Se você não solicitou, ignore esta mensagem.`;
  await db.query(
    'INSERT INTO mail_outbox(id,account_id,recipient,subject,body) VALUES($1,$2,$3,$4,$5)',
    [randomUUID(), id, email, subject, body],
  );
}
export function registerAccountRoutes(
  app: FastifyInstance,
  user: (r: FastifyRequest) => NonNullable<FastifyRequest['account']>,
) {
  const limits = { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } };
  const password = z.string().min(12, 'Use pelo menos 12 caracteres.').max(128);
  app.post('/api/auth/forgot', limits, async (request) => {
    const { email } = z
      .object({
        email: z
          .string()
          .trim()
          .email()
          .transform((v) => v.toLowerCase()),
      })
      .parse(request.body);
    if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST)
      throw new HttpError(503, 'Envio de e-mail ainda não configurado.');
    await transaction(async (db) => {
      const account = (
        await db.query(
          'SELECT id,email FROM accounts WHERE email=$1 AND deleted_at IS NULL FOR UPDATE',
          [email],
        )
      ).rows[0];
      if (account) await issueAccountToken(db, account.id, account.email, 'reset');
    });
    return {
      message: 'Se houver uma conta com esse e-mail, enviaremos as instruções.',
      delivery: process.env.SMTP_HOST ? 'email' : 'local-demo',
    };
  });
  app.post('/api/auth/reset', limits, async (request) => {
    const d = z.object({ token: z.string().min(20).max(200), password }).parse(request.body);
    const hash = await hashPassword(d.password);
    await transaction(async (db) => {
      const row = (
        await db.query(
          "SELECT t.account_id FROM account_tokens t JOIN accounts a ON a.id=t.account_id WHERE t.token_hash=$1 AND t.purpose='reset' AND t.used_at IS NULL AND t.expires_at>now() AND a.deleted_at IS NULL FOR UPDATE OF a",
          [tokenHash(d.token)],
        )
      ).rows[0];
      if (!row)
        throw new HttpError(422, 'Código inválido, expirado ou já utilizado. Solicite outro.');
      const consumed = await db.query(
        'UPDATE account_tokens SET used_at=now() WHERE token_hash=$1 AND used_at IS NULL RETURNING account_id',
        [tokenHash(d.token)],
      );
      if (!consumed.rowCount) throw new HttpError(422, 'Código já utilizado.');
      await db.query('UPDATE accounts SET password_hash=$1 WHERE id=$2', [hash, row.account_id]);
      await db.query('DELETE FROM sessions WHERE account_id=$1', [row.account_id]);
      await db.query(
        "UPDATE account_tokens SET used_at=now() WHERE account_id=$1 AND purpose='reset'",
        [row.account_id],
      );
    });
    return { ok: true };
  });
  app.post('/api/me/verification', limits, async (request) => {
    const u = user(request);
    if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST)
      throw new HttpError(503, 'Envio de e-mail ainda não configurado.');
    await transaction((db) => issueAccountToken(db, u.id, u.email, 'verify'));
    return { ok: true, delivery: process.env.SMTP_HOST ? 'email' : 'local-demo' };
  });
  app.post('/api/me/verification/confirm', limits, async (request) => {
    const u = user(request);
    const { token } = z.object({ token: z.string().min(20).max(200) }).parse(request.body);
    await transaction(async (db) => {
      const result = await db.query(
        "UPDATE account_tokens SET used_at=now() WHERE token_hash=$1 AND account_id=$2 AND purpose='verify' AND used_at IS NULL AND expires_at>now() RETURNING account_id",
        [tokenHash(token), u.id],
      );
      if (!result.rowCount) throw new HttpError(422, 'Código inválido, expirado ou já utilizado.');
      await db.query('UPDATE accounts SET email_verified_at=now() WHERE id=$1', [u.id]);
    });
    return { ok: true };
  });
  app.post('/api/me/password', limits, async (request) => {
    const u = user(request);
    const d = z.object({ current_password: z.string().max(128), password }).parse(request.body);
    await transaction(async (db) => {
      const account = (
        await db.query('SELECT password_hash FROM accounts WHERE id=$1 FOR UPDATE', [u.id])
      ).rows[0];
      if (!(await verifyPassword(d.current_password, account.password_hash)))
        throw new HttpError(403, 'A senha atual não confere.');
      await db.query('UPDATE accounts SET password_hash=$1 WHERE id=$2', [
        await hashPassword(d.password),
        u.id,
      ]);
      await db.query('DELETE FROM sessions WHERE account_id=$1', [u.id]);
    });
    return { ok: true };
  });
  app.delete('/api/me', limits, async (request) => {
    const u = user(request);
    const d = z
      .object({ password: z.string().max(128), confirmation: z.literal('EXCLUIR') })
      .parse(request.body);
    await transaction(async (db) => {
      await db.query('SELECT pg_advisory_xact_lock(878125)');
      const account = (
        await db.query('SELECT password_hash FROM accounts WHERE id=$1 FOR UPDATE', [u.id])
      ).rows[0];
      if (!(await verifyPassword(d.password, account.password_hash)))
        throw new HttpError(403, 'A senha não confere.');
      const last = await db.query(
        "SELECT 1 FROM roles r WHERE r.account_id=$1 AND r.role='admin' AND r.revoked_at IS NULL AND NOT EXISTS(SELECT 1 FROM roles x WHERE x.municipality_id=r.municipality_id AND x.role='admin' AND x.revoked_at IS NULL AND x.account_id<>$1)",
        [u.id],
      );
      if (last.rowCount)
        throw new HttpError(409, 'Transfira a administração municipal antes de excluir a conta.');
      await db.query(
        "UPDATE accounts SET name='Conta excluída',email=$2,password_hash=$3,deleted_at=now(),email_verified_at=NULL,reminders=false WHERE id=$1",
        [u.id, u.id + '@deleted.invalid', await hashPassword(newToken())],
      );
      await db.query('DELETE FROM sessions WHERE account_id=$1', [u.id]);
      await db.query('DELETE FROM account_tokens WHERE account_id=$1', [u.id]);
      await db.query('DELETE FROM mail_outbox WHERE account_id=$1', [u.id]);
      await db.query('DELETE FROM follows WHERE account_id=$1', [u.id]);
      await db.query(
        'DELETE FROM notifications WHERE account_id=$1 OR post_id IN(SELECT id FROM posts WHERE author_id=$1)',
        [u.id],
      );
      await db.query(
        'UPDATE participations SET active=false WHERE account_id=$1 OR post_id IN(SELECT id FROM posts WHERE author_id=$1)',
        [u.id],
      );
      await db.query(
        "UPDATE posts SET visibility='removed',title='Publicação de conta excluída',description='Conteúdo removido.',location='Não disponível',issuer=NULL WHERE author_id=$1",
        [u.id],
      );
      await db.query(
        "UPDATE replies SET visibility='removed',body='Resposta de conta excluída.' WHERE author_id=$1",
        [u.id],
      );
      await db.query(
        "UPDATE audit SET details='{}' WHERE post_id IN(SELECT id FROM posts WHERE author_id=$1)",
        [u.id],
      );
      await db.query(
        "UPDATE audit SET reason='Registro de conta excluída',details='{}' WHERE actor_id=$1",
        [u.id],
      );
      await db.query(
        "UPDATE reports SET reason='Denúncia de conta excluída.' WHERE reporter_id=$1",
        [u.id],
      );
      await db.query(
        "UPDATE appeals SET reason='Recurso de conta excluída.',state='closed' WHERE author_id=$1",
        [u.id],
      );
      await db.query('UPDATE roles SET revoked_at=now() WHERE account_id=$1', [u.id]);
      await db.query('DELETE FROM media WHERE owner_id=$1', [u.id]);
    });
    return { ok: true };
  });
}
