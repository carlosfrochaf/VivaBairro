import { populateDemo } from './demo-data.js';
import { randomUUID } from 'node:crypto';
import { pool, transaction } from './db.js';
import { hashPassword } from './security.js';
if (process.env.NODE_ENV === 'production')
  throw Error('Dados fictícios não podem ser carregados em produção.');
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 12)
  throw Error(
    'Defina SEED_PASSWORD com pelo menos 12 caracteres para as contas locais de demonstração.',
  );
const hash = await hashPassword(password);
await transaction(async (db) => {
  await db.query(
    "INSERT INTO municipalities VALUES('demo','Município de demonstração') ON CONFLICT DO NOTHING",
  );
  for (const [id, name] of [
    ['aurora', 'Jardim Aurora'],
    ['centro', 'Centro'],
    ['esperanca', 'Vila Esperança'],
  ])
    await db.query(
      'INSERT INTO neighborhoods(id,municipality_id,name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
      [id, 'demo', name],
    );
  for (const role of ['morador', 'moderador', 'admin']) {
    const email = role + '@vivabairro.test';
    const found = await db.query('SELECT id FROM accounts WHERE email=$1', [email]);
    if (found.rowCount) continue;
    const id = randomUUID();
    await db.query(
      'INSERT INTO accounts(id,name,email,password_hash,neighborhood_id) VALUES($1,$2,$3,$4,$5)',
      [id, role + ' de demonstração', email, hash, 'aurora'],
    );
    if (role !== 'morador')
      await db.query(
        'INSERT INTO roles(id,account_id,municipality_id,neighborhood_id,role) VALUES($1,$2,$3,$4,$5)',
        [
          randomUUID(),
          id,
          'demo',
          role === 'admin' ? null : 'aurora',
          role === 'admin' ? 'admin' : 'moderator',
        ],
      );
    if (role === 'morador') {
      await db.query(
        "INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,starts_at,ends_at,capacity) VALUES($1,$2,'aurora','event','Mutirão da Praça do Sol','Vamos cuidar dos canteiros e organizar a praça. Traga água e proteção solar.','Coreto da Praça do Sol',now()+interval '3 days',now()+interval '3 days 3 hours',20)",
        [randomUUID(), id],
      );
      await db.query(
        "INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,category) VALUES($1,$2,'aurora','notice','Luz apagada na Rua das Acácias','O poste em frente à padaria está apagado há três noites.','Rua das Acácias, em frente à padaria','infraestrutura')",
        [randomUUID(), id],
      );
    }
  }
  await db.query(`INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,starts_at,ends_at,capacity)
    SELECT '17c268ad-1450-46e3-9c2b-11889340e276',id,'aurora','event','Aula de horta',
    'Encontro de demonstração para aprender a preparar canteiros e cuidar de uma horta comunitária.',
    'Horta comunitária do Jardim Aurora',now()+interval '4 days',now()+interval '4 days 2 hours',12
    FROM accounts WHERE email='morador@vivabairro.test' ON CONFLICT(id) DO NOTHING`);
  await populateDemo(db, hash);
});
console.log('Dados fictícios inseridos sem substituir registros existentes.');
await pool.end();
