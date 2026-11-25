import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import staticFiles from '@fastify/static';
import { populateDemo, demoId } from './demo-data.js';
import { hashPassword, newToken } from './security.js';

const host = new URL(process.env.DATABASE_URL ?? '').hostname;
if (!/^ep-blue-sky-besc03zr(-pooler)?\.[a-z0-9.-]+\.neon\.tech$/.test(host)) {
  throw Error('A feira exige conexão com o projeto Neon VivaBairro-EXPOUNA.');
}
process.env.EXPOUNA = 'true';
execFileSync(process.execPath, [fileURLToPath(new URL('./migrate.js', import.meta.url))], {
  stdio: 'inherit',
});
const { transaction } = await import('./db.js');
await transaction(async (db) => {
  await db.query('SELECT pg_advisory_xact_lock(878126)');
  const marker = demoId('expouna:encontro');
  if ((await db.query('SELECT id FROM posts WHERE id=$1', [marker])).rowCount) return;
  await db.query("INSERT INTO municipalities VALUES('demo','Município de demonstração')");
  for (const [id, name] of [
    ['centro', 'Centro'],
    ['aurora', 'Jardim Aurora'],
    ['esperanca', 'Vila Esperança'],
  ]) {
    await db.query("INSERT INTO neighborhoods(id,municipality_id,name) VALUES($1,'demo',$2)", [
      id,
      name,
    ]);
  }
  await populateDemo(db, await hashPassword(newToken()));
  await db.query(
    "INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,starts_at,ends_at,capacity) VALUES($1,$2,'centro','event','Encontro de demonstracao - evento ficticio','Evento fictício para demonstrar inscrição, vagas e cancelamento de presença.','Centro comunitario ficticio','2026-12-15T18:00:00-03:00','2026-12-15T20:00:00-03:00',1)",
    [marker, demoId('carla')],
  );
});
const { buildApp } = await import('./app.js');
const app = await buildApp();
await app.register(staticFiles, { root: fileURLToPath(new URL('../fair-web/', import.meta.url)) });
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 3001) });
