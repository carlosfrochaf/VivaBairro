import nodemailer from 'nodemailer';
import { pool, transaction } from './db.js';

export async function createReminders() {
  // A chave inclui o horário: uma remarcação permite um novo lembrete, sem duplicar o anterior.
  const result =
    await pool.query(`INSERT INTO notifications(id,account_id,post_id,message,dedupe_key)
    SELECT gen_random_uuid(),a.id,p.id,'Seu evento acontece nas próximas 24 horas: '||p.title,
      'reminder:'||p.id||':'||a.id||':'||p.starts_at::text
    FROM participations x JOIN accounts a ON a.id=x.account_id JOIN posts p ON p.id=x.post_id
    WHERE x.active AND a.reminders AND a.deleted_at IS NULL AND p.visibility='visible' AND p.state<>'cancelado'
      AND p.starts_at>now() AND p.starts_at<=now()+interval '24 hours'
    ON CONFLICT(dedupe_key) DO NOTHING RETURNING id`);
  return result.rowCount ?? 0;
}
export async function deliverMail() {
  if (!process.env.SMTP_HOST) return 0;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
  let sent = 0;
  for (let i = 0; i < 10; i++) {
    const handled = await transaction(async (db) => {
      const mail = (
        await db.query(
          "SELECT * FROM mail_outbox WHERE status='pending' AND attempts<3 AND created_at>now()-interval '25 minutes' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED",
        )
      ).rows[0];
      if (!mail) return false;
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: mail.recipient,
          subject: mail.subject,
          text: mail.body,
          messageId: `<${mail.id}@vivabairro.local>`,
        });
        await db.query("UPDATE mail_outbox SET status='sent',sent_at=now(),body='' WHERE id=$1", [
          mail.id,
        ]);
        sent++;
      } catch {
        await db.query('UPDATE mail_outbox SET attempts=attempts+1 WHERE id=$1', [mail.id]);
      }
      return true;
    });
    if (!handled) break;
  }
  transporter.close();
  return sent;
}
export async function runJobs() {
  const reminders = await createReminders();
  const emails = await deliverMail();
  await pool.query(
    "DELETE FROM sessions WHERE expires_at<now(); DELETE FROM account_tokens WHERE expires_at<now(); DELETE FROM mail_outbox WHERE created_at<now()-interval '1 day'",
  );
  return { reminders, emails };
}
