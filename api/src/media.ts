import type { FastifyInstance, FastifyRequest } from 'fastify';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { pool } from './db.js';
import { HttpError } from './errors.js';
export function registerMediaRoutes(
  app: FastifyInstance,
  user: (r: FastifyRequest) => NonNullable<FastifyRequest['account']>,
) {
  app.post(
    '/api/media',
    { bodyLimit: 3_000_000, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request) => {
      const u = user(request);
      const { data } = z
        .object({
          data: z
            .string()
            .min(4)
            .max(2_800_000)
            .regex(/^[A-Za-z0-9+/]+={0,2}$/),
        })
        .parse(request.body);
      const input = Buffer.from(data, 'base64');
      if (input.length > 2_000_000) throw new HttpError(422, 'Escolha uma imagem de até 2 MB.');
      let output: Buffer;
      try {
        const image = sharp(input, { limitInputPixels: 25_000_000 });
        const meta = await image.metadata();
        if (!['jpeg', 'png', 'webp'].includes(meta.format ?? '') || (meta.pages ?? 1) > 1)
          throw Error('format');
        output = await image
          .rotate()
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch {
        throw new HttpError(422, 'Imagem inválida. Use JPG, PNG ou WebP, sem animação.');
      }
      const id = randomUUID();
      await pool.query('INSERT INTO media(id,owner_id,mime,data) VALUES($1,$2,$3,$4)', [
        id,
        u.id,
        'image/jpeg',
        output,
      ]);
      return { id };
    },
  );
  app.get('/api/media/:id', async (request, reply) => {
    const u = user(request);
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const media = (
      await pool.query(
        "SELECT m.mime,m.data FROM media m WHERE m.id=$1 AND (m.owner_id=$2 OR EXISTS(SELECT 1 FROM posts p WHERE p.photo_id=m.id AND p.visibility='visible') OR EXISTS(SELECT 1 FROM posts p JOIN neighborhoods n ON n.id=p.neighborhood_id JOIN roles r ON r.municipality_id=n.municipality_id WHERE p.photo_id=m.id AND r.account_id=$2 AND r.revoked_at IS NULL AND (r.role='admin' OR r.neighborhood_id=n.id)))",
        [id, u.id],
      )
    ).rows[0];
    if (!media) throw new HttpError(404, 'Imagem indisponível.');
    return reply
      .header('Cache-Control', 'private, no-store')
      .header('X-Content-Type-Options', 'nosniff')
      .type(media.mime)
      .send(media.data);
  });
}
export async function validatePhoto(id: string | null | undefined, owner: string) {
  if (
    id &&
    !(await pool.query('SELECT 1 FROM media WHERE id=$1 AND owner_id=$2', [id, owner])).rowCount
  )
    throw new HttpError(422, 'Escolha uma imagem enviada pela sua conta.');
}
