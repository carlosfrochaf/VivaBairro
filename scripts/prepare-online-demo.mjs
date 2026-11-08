// Execute npm --prefix api run build antes. Gera SQL; não conecta a nenhum banco.
import { mkdir, writeFile } from 'node:fs/promises';
import { populateDemo } from '../api/dist/demo-data.js';
import { hashPassword, newToken } from '../api/dist/security.js';

const accounts = [];
const inserts = [];
function literal(value) {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) return "'\\x" + value.toString('hex') + "'::bytea";
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value !== 'string') throw Error('Tipo de parâmetro não suportado.');
  return "'" + value.replaceAll("'", "''") + "'";
}

// Adaptador limitado às consultas do gerador de exemplos. Nenhum dado local é lido.
const recorder = {
  async query(sql, parameters = []) {
    if (sql.startsWith('SELECT id,email FROM accounts')) {
      return { rows: accounts, rowCount: accounts.length };
    }
    if (!/^INSERT INTO (accounts|media|posts|participations|replies|demo_records)\b/.test(sql)) {
      throw Error('O gerador mudou: revisar a consulta antes de exportar.');
    }
    if (sql.startsWith('INSERT INTO accounts')) {
      if (!parameters[2].endsWith('@vivabairro.test')) {
        throw Error('Somente contas fictícias podem entrar nesta carga.');
      }
      accounts.push({ id: parameters[0], email: parameters[2] });
    }
    inserts.push(sql.replace(/\$(\d+)\b/g, (_, index) => {
      if (Number(index) > parameters.length) throw Error('Parâmetro SQL ausente.');
      return literal(parameters[Number(index) - 1]);
    }) + ';');
    return { rows: [], rowCount: 1 };
  },
};

// Senha aleatória descartada: não copia credenciais e não libera login de demonstração.
await populateDemo(recorder, await hashPassword(newToken()));
const sql = `DO $load_vivabairro$ BEGIN
PERFORM pg_advisory_xact_lock(878126);
IF NOT EXISTS(SELECT 1 FROM municipalities WHERE id='demo' AND name='Município de demonstração')
OR (SELECT count(*) FROM neighborhoods WHERE municipality_id='demo' AND id IN ('aurora','centro','esperanca'))<>3
THEN RAISE EXCEPTION 'Território de demonstração não confirmado'; END IF;
${inserts.join('\n')}
END $load_vivabairro$;
`;
const directory = new URL('../.local/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('online-demo.sql', directory), sql);
console.log(`SQL preparado em .local/online-demo.sql: ${accounts.length} autores fictícios. Nenhum banco foi alterado.`);
