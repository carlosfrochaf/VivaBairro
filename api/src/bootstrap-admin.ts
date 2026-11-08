import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { pool, transaction } from './db.js';
import { hashPassword } from './security.js';
const { values } = parseArgs({
  options: {
    municipality: { type: 'string' },
    name: { type: 'string' },
    neighborhood: { type: 'string' },
    email: { type: 'string' },
  },
});
const d = z
  .object({
    municipality: z.string().min(2),
    name: z.string().min(2),
    neighborhood: z.string().min(2),
    email: z.string().email(),
  })
  .parse(values);
const password = z.string().min(12).parse(process.env.BOOTSTRAP_PASSWORD);
await transaction(async (db) => {
  await db.query('SELECT pg_advisory_xact_lock(878125)');
  await db.query('INSERT INTO municipalities VALUES($1,$2) ON CONFLICT DO NOTHING', [
    d.municipality,
    d.name,
  ]);
  if (
    (
      await db.query(
        "SELECT 1 FROM roles WHERE municipality_id=$1 AND role='admin' AND revoked_at IS NULL",
        [d.municipality],
      )
    ).rowCount
  )
    throw Error('Município já possui administrador; não será sobrescrito.');
  const area = d.municipality + '-principal';
  await db.query(
    'INSERT INTO neighborhoods(id,municipality_id,name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
    [area, d.municipality, d.neighborhood],
  );
  const id = randomUUID();
  await db.query(
    'INSERT INTO accounts(id,name,email,password_hash,neighborhood_id) VALUES($1,$2,$3,$4,$5)',
    [id, 'Administrador municipal', d.email.toLowerCase(), await hashPassword(password), area],
  );
  await db.query("INSERT INTO roles(id,account_id,municipality_id,role) VALUES($1,$2,$3,'admin')", [
    randomUUID(),
    id,
    d.municipality,
  ]);
  await db.query(
    "INSERT INTO audit(id,actor_id,action,reason,details) VALUES($1,$2,'bootstrap-admin','Provisionamento realizado pelo operador do servidor',$3)",
    [randomUUID(), id, JSON.stringify({ municipality: d.municipality })],
  );
});
console.log('Administrador inicial criado. A senha não é registrada no terminal.');
await pool.end();
