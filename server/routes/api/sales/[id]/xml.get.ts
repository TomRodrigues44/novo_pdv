import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    const result = await sql`
          SELECT xml_content, xml_chave, xml_numero, created_at, total_amount
          FROM sales
          WHERE id = ${id}
        `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sale not found',
      });
    }
    
    const sale = result[0];
    
    if (!sale.xml_content) {
      throw createError({
        statusCode: 404,
        statusMessage: 'XML not available for this sale',
      });
    }
    
    // Set headers for XML download
    setResponseHeaders(event, {
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="nfe-${sale.xml_numero || sale.id.slice(-6)}.xml"`,
    });
    
    return sale.xml_content;
  } catch (error) {
    console.error('Error downloading XML:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error downloading XML',
    });
  }
});