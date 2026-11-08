import { readFile, readdir } from 'node:fs/promises';
import { pool, transaction } from './db.js';
await transaction(async (db) => {
  await db.query('SELECT pg_advisory_xact_lock(878124)');
  await db.query(
    'CREATE TABLE IF NOT EXISTS migrations(version text PRIMARY KEY, applied_at timestamptz DEFAULT now())',
  );
  const directory = new URL('../migrations/', import.meta.url);
  for (const filename of (await readdir(directory)).filter((f) => f.endsWith('.sql')).sort()) {
    const version = filename.split('_')[0];
    const done = await db.query('SELECT version FROM migrations WHERE version=$1', [version]);
    if (!done.rowCount) {
      await db.query(await readFile(new URL(filename, directory), 'utf8'));
      await db.query('INSERT INTO migrations(version) VALUES($1)', [version]);
    }
  }
});
console.log('Migrações aplicadas.');
await pool.end();
