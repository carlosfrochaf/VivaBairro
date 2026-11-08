import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
const directory = resolve('../.local/postgres');
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: 'vivabairro',
  password: 'local-development-only',
  port: 54329,
  persistent: true,
  authMethod: 'scram-sha-256',
  postgresFlags: ['-c', 'listen_addresses=127.0.0.1'],
  onLog: () => {},
  onError: console.error,
});
if (!existsSync(resolve(directory, 'PG_VERSION'))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
if (!(await client.query("SELECT 1 FROM pg_database WHERE datname='vivabairro'")).rowCount)
  await pg.createDatabase('vivabairro');
await client.end();
console.log('PostgreSQL local em 127.0.0.1:54329. Dados em .local/postgres. Ctrl+C para parar.');
const timer = setInterval(() => {}, 60000);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    clearInterval(timer);
    await pg.stop();
    process.exit(0);
  });
