import { runJobs } from './jobs.js';
import { buildApp } from './app.js';
import { pool } from './db.js';
const app = await buildApp();
await app.listen({ host: process.env.HOST ?? '127.0.0.1', port: Number(process.env.PORT ?? 3001) });
console.log('VivaBairro API iniciada.');
let running = false;
const tick = async () => {
  if (running) return;
  running = true;
  try {
    await runJobs();
  } catch {
    console.error(
      'Falha no processamento de notificações/e-mails. Verifique o banco e as configurações.',
    );
  } finally {
    running = false;
  }
};
const timer = process.env.JOBS_ENABLED === 'true' ? setInterval(tick, 60_000) : null;
if (timer) {
  timer.unref();
  void tick();
}
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, async () => {
    if (timer) clearInterval(timer);
    await app.close();
    await pool.end();
    process.exit(0);
  });
