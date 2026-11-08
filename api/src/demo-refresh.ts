import { pool, transaction } from './db.js';
if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE !== 'true')
  throw Error('Disponível apenas com DEMO_MODE=true fora de produção.');
// Reagenda somente eventos registrados pelo seed. Nunca altera publicações criadas na interface.
const result = await transaction(async (db) =>
  db.query(`WITH ordered AS (
  SELECT p.id,row_number() OVER(ORDER BY p.title) AS position FROM posts p JOIN demo_records d ON d.record_id=p.id AND d.kind='post'
  WHERE p.kind='event' AND p.visibility='visible' AND p.title NOT LIKE '%realizado%'
) UPDATE posts p SET starts_at=now()+(o.position * interval '1 day'),ends_at=now()+(o.position * interval '1 day')+interval '2 hours',updated_at=now() FROM ordered o WHERE p.id=o.id RETURNING p.id`),
);
console.log(
  `${result.rowCount} eventos fictícios reagendados. Contas e conteúdo da equipe foram preservados.`,
);
await pool.end();
