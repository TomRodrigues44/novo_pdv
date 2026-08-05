import { sql } from '../../../utils/db';
import { generateNfeXml } from '../../../lib/nfe/generator';
import { authorizeNfe } from '../../../lib/nfe/sefaz';
import { ensureNfeSchema } from '../../../lib/nfe/schema';
import { loadActiveCertificate } from '../../../lib/nfe/certificate';
import { signNfeXml } from '../../../lib/nfe/signer';

const digits = (value: unknown) => String(value ?? '').replace(/\D/g, '');
const text = (value: unknown) => String(value ?? '').trim();

export default defineEventHandler(async (event) => {
  try {
    await ensureNfeSchema();
    const body = await readBody(event);
    const customer = body.customer || {};
    const requestedItems = Array.isArray(body.items) ? body.items : [];
    const payments = Array.isArray(body.payments) ? body.payments : [];
    const freight = Math.max(Number(body.freight) || 0, 0);

    const document = digits(customer.cpf_cnpj);
    const requiredCustomerFields = ['name', 'cep', 'logradouro', 'numero', 'bairro', 'municipio', 'uf', 'codigo_municipio'];
    const missingCustomerFields = requiredCustomerFields.filter((field) => !text(customer[field]));
    if (![11, 14].includes(document.length) || missingCustomerFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Preencha CPF/CNPJ e todos os campos obrigatórios do endereço do destinatário.',
      });
    }
    if (digits(customer.cep).length !== 8 || digits(customer.codigo_municipio).length !== 7) {
      throw createError({ statusCode: 400, statusMessage: 'CEP ou código IBGE do município inválido.' });
    }
    if (!/^[A-Za-z]{2}$/.test(text(customer.uf))) {
      throw createError({ statusCode: 400, statusMessage: 'UF do destinatário inválida.' });
    }
    if (requestedItems.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Adicione pelo menos um produto à NF-e.' });
    }

    const productIds = [...new Set(requestedItems.map((item: any) => text(item.productId)).filter(Boolean))];
    const products = await sql`
      SELECT id, name, price, stock, fiscal
      FROM products
      WHERE id = ANY(${productIds}::text[])
    `;
    const productMap = new Map(products.map((product) => [String(product.id), product]));

    const items = requestedItems.map((requested: any) => {
      const product = productMap.get(text(requested.productId));
      const quantity = Number(requested.quantity);
      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Produto ou quantidade inválida.' });
      }
      if (product.stock !== null && Number(product.stock) < quantity) {
        throw createError({ statusCode: 400, statusMessage: `Estoque insuficiente para ${product.name}.` });
      }

      const fiscal = typeof product.fiscal === 'string' ? JSON.parse(product.fiscal) : (product.fiscal || {});
      if (digits(fiscal.ncm).length !== 8) {
        throw createError({
          statusCode: 400,
          statusMessage: `Complete o NCM do produto “${product.name}” no cadastro de produtos.`,
        });
      }

      return {
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price),
        quantity,
        fiscal,
      };
    });

    const productsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = productsTotal + freight;
    const paymentsTotal = payments.reduce((sum: number, payment: any) => sum + (Number(payment.amount) || 0), 0);
    if (payments.length === 0 || Math.abs(paymentsTotal - total) > 0.01) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A soma das formas de pagamento deve ser igual ao total da NF-e.',
      });
    }

    const configRows = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (configRows.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Configure os dados fiscais da empresa antes de emitir.' });
    }

    const numberRows = await sql`
      UPDATE company_fiscal_config
      SET ultima_nfe = COALESCE(ultima_nfe, 0) + 1
      WHERE id = ${configRows[0].id}
      RETURNING ultima_nfe, serie_nfe
    `;
    const number = Number(numberRows[0].ultima_nfe);
    const series = Number(numberRows[0].serie_nfe || 1);
    const ambiente = configRows[0].ambiente === 'producao' ? 'producao' : 'homologacao';
    const generated = generateNfeXml({
      customer: { ...customer, cpf_cnpj: document },
      items,
      payments,
      freight,
      freightMode: body.freightMode,
    }, configRows[0], number, series);

    // Carregar certificado digital A1
    const certificate = await loadActiveCertificate();

    // Assinar o XML da NF-e com o certificado digital
    const { signedXml } = signNfeXml(
      generated.xml,
      generated.accessKey,
      certificate.privateKeyPem,
      certificate.certificateBase64,
    );

    // Enviar para a SEFAZ-RR e aguardar autorização
    const authorization = await authorizeNfe(signedXml, generated.accessKey, ambiente, certificate);

    if (!authorization.success) {
      // NF-e rejeitada — não registra a venda, mas decrementa o número
      // para que possa ser reutilizado na próxima tentativa
      await sql`
        UPDATE company_fiscal_config
        SET ultima_nfe = GREATEST(COALESCE(ultima_nfe, 1) - 1, 0)
        WHERE id = ${configRows[0].id}
      `;
      throw createError({
        statusCode: 422,
        statusMessage: `SEFAZ rejeitou a NF-e: ${authorization.message}`,
      });
    }

    const result = await sql.transaction(async (transaction) => {
      const customerId = text(customer.id) || `customer-nfe-${Date.now()}`;
      const address = `${text(customer.logradouro)}, ${text(customer.numero)} - ${text(customer.bairro)}, ${text(customer.municipio)}/${text(customer.uf).toUpperCase()}`;
      const existingCustomer = await transaction`SELECT id FROM customers WHERE id = ${customerId} LIMIT 1`;

      if (existingCustomer.length > 0) {
        await transaction`
          UPDATE customers SET
            name = ${text(customer.name)}, phone = ${text(customer.phone) || null},
            email = ${text(customer.email) || null}, address = ${address},
            cpf_cnpj = ${document}, inscricao_estadual = ${digits(customer.inscricao_estadual) || null},
            cep = ${digits(customer.cep)}, logradouro = ${text(customer.logradouro)}, numero = ${text(customer.numero)},
            complemento = ${text(customer.complemento) || null}, bairro = ${text(customer.bairro)},
            municipio = ${text(customer.municipio)}, uf = ${text(customer.uf).toUpperCase()},
            codigo_municipio = ${digits(customer.codigo_municipio)}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${customerId}
        `;
      } else {
        await transaction`
          INSERT INTO customers (
            id, name, phone, address, email, points, total_spent, cpf_cnpj, inscricao_estadual,
            cep, logradouro, numero, complemento, bairro, municipio, uf, codigo_municipio
          ) VALUES (
            ${customerId}, ${text(customer.name)}, ${text(customer.phone) || null}, ${address},
            ${text(customer.email) || null}, 0, 0, ${document}, ${digits(customer.inscricao_estadual) || null},
            ${digits(customer.cep)}, ${text(customer.logradouro)}, ${text(customer.numero)},
            ${text(customer.complemento) || null}, ${text(customer.bairro)}, ${text(customer.municipio)},
            ${text(customer.uf).toUpperCase()}, ${digits(customer.codigo_municipio)}
          )
        `;
      }

      const dailyRows = await transaction`
        SELECT COALESCE(MAX(daily_sale_number), 99) + 1 AS next_number
        FROM sales WHERE DATE(created_at) = CURRENT_DATE
      `;
      const saleRows = await transaction`
        INSERT INTO sales (total_amount, customer_id, freight, status, daily_sale_number, xml_chave, xml_numero, xml_status, xml_content)
        VALUES (${total}, ${customerId}, ${freight}, 'delivered', ${dailyRows[0].next_number},
          ${generated.accessKey}, ${number}, 'autorizada', ${signedXml})
        RETURNING id, daily_sale_number
      `;
      const sale = saleRows[0];

      for (const item of items) {
        await transaction`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
          VALUES (${sale.id}, ${item.id}, ${item.name}, ${item.quantity}, ${item.price}, ${null})
        `;
        await transaction`
          UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.id}
        `;
      }

      for (const payment of payments) {
        await transaction`
          INSERT INTO sale_payments (sale_id, payment_type, amount)
          VALUES (${sale.id}, ${text(payment.type)}, ${Number(payment.amount)})
        `;
      }

      await transaction`
        UPDATE customers SET total_spent = COALESCE(total_spent, 0) + ${total} WHERE id = ${customerId}
      `;

      const nfeRows = await transaction`
        INSERT INTO nfe (
          sale_id, customer_id, chave_acesso, numero, serie, status, ambiente, protocolo,
          data_autorizacao, valor_produtos, valor_frete, valor_total, destinatario, itens,
          pagamentos, xml_envio, xml_retorno, url_consulta, mensagem_status
        ) VALUES (
          ${String(sale.id)}, ${customerId}, ${generated.accessKey}, ${number}, ${series}, 'autorizada',
          ${ambiente}, ${authorization.protocol || null}, CURRENT_TIMESTAMP, ${productsTotal}, ${freight},
          ${total}, ${JSON.stringify(customer)}::jsonb, ${JSON.stringify(items)}::jsonb,
          ${JSON.stringify(payments)}::jsonb, ${signedXml}, ${authorization.authorizationXml || authorization.rawResponse || null},
          ${generated.consultationUrl}, ${authorization.message}
        ) RETURNING id
      `;

      return {
        nfeId: nfeRows[0].id,
        saleId: sale.id,
        dailySaleNumber: sale.daily_sale_number,
        customerId,
      };
    });

    const motoboy = body.motoboy;
    let sangriaCreated = false;

    if (freight > 0 && motoboy && motoboy.id && motoboy.name) {
      const openRegister = await sql`
        SELECT id FROM cash_registers
        WHERE status = 'open'
        ORDER BY opened_at DESC
        LIMIT 1
      `;
      if (openRegister.length > 0) {
        await sql`
          INSERT INTO cash_transactions (id, cash_register_id, type, amount, description)
          VALUES (${'trans-nfe-' + Date.now()}, ${openRegister[0].id}, 'withdrawal', ${freight},
            ${'Taxa Entrega NF-e - ' + text(motoboy.name)})
        `;
        sangriaCreated = true;
      }
    }

    return {
      success: true,
      message: ambiente === 'producao'
        ? 'NF-e autorizada em produção e venda registrada com sucesso.'
        : 'NF-e autorizada em homologação e venda registrada com sucesso.',
      nfe: {
        id: result.nfeId,
        number,
        series,
        accessKey: generated.accessKey,
        protocol: authorization.protocol,
        status: 'autorizada',
        environment: ambiente,
        consultationUrl: generated.consultationUrl,
      },
      sale: {
        id: result.saleId,
        dailySaleNumber: result.dailySaleNumber,
        total,
      },
      customerId: result.customerId,
      sangriaCreated,
    };
  } catch (error: any) {
    console.error('Erro ao emitir NF-e:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao emitir NF-e.',
    });
  }
});
