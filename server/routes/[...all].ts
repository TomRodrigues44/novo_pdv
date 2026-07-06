import { defineEventHandler } from 'h3';
import { readFileSync } from 'fs';
import { join } from 'path';

export default defineEventHandler((event) => {
  // Se for uma rota da API, não interceptar
  if (event.node.req.url?.startsWith('/api')) {
    return;
  }

  // Servir o index.html para todas as outras rotas
  const indexPath = join(process.cwd(), 'index.html');
  
  try {
    const html = readFileSync(indexPath, 'utf-8');
    return html;
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
    });
  }
});