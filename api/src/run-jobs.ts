import { runJobs } from './jobs.js';
import { pool } from './db.js';
try {
  console.log(await runJobs());
} finally {
  await pool.end();
}
