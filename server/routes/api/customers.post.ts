import { sql } from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const customer = await readBody(event);
    
    const result = await sql`
          INSERT INTO customers (id, name, phone, address, email, points, total_spent, cpf_cnpj, inscricao_estadual, cep, logradouro, numero, complemento, bairro, municipio, uf, codigo_municipio)
          VALUES (
            ${customer.id},
            ${customer.name},
            ${customer.phone || null},
            ${customer.address || null},
            ${customer.email || null},
            ${customer.points || 0},
            ${customer.total_spent || 0},
            ${customer.cpf_cnpj || null},
            ${customer.inscricao_estadual || null},
            ${customer.cep || null},
            ${customer.logradouro || null},
            ${customer.numero || null},
            ${customer.complemento || null},
            ${customer.bairro || null},
            ${customer.municipio || null},
            ${customer.uf || null},
            ${customer.codigo_municipio || null}
          )
          RETURNING *
        `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating customer:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating customer',
    });
  }
});