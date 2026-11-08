import 'dotenv/config';
import pg from 'pg';
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.DATABASE_URL || process.env.DEMO_MODE === 'true')
) {
  throw new Error('Produção exige DATABASE_URL e DEMO_MODE desabilitado.');
}
export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://vivabairro:local-development-only@127.0.0.1:54329/vivabairro',
  max: 10,
});
export async function transaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const value = await work(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
