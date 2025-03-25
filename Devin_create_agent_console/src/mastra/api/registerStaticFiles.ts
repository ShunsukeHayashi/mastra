import { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs';

/**
 * Register static files for the business card UI
 */
export async function registerStaticFiles(fastify: FastifyInstance) {
  // Register static file for business card UI
  fastify.get('/business-card', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'public', 'business-card.html');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      reply.type('text/html').send(content);
    } catch (error) {
      console.error('Error serving business card UI:', error);
      reply.code(500).send('Error loading business card UI');
    }
  });
}
