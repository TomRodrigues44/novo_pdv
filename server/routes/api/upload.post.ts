import { defineEventHandler, createError } from 'h3';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event);
    const file = formData.get('file') as File;

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum arquivo enviado',
      });
    }

    // Validar se é uma imagem
    if (!file.type.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'O arquivo deve ser uma imagem',
      });
    }

    // Criar diretório de produtos se não existir
    const productsDir = join(process.cwd(), 'public', 'products');
    await mkdir(productsDir, { recursive: true });

    // Gerar nome único para o arquivo
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const filepath = join(productsDir, filename);

    // Converter File para Buffer e salvar
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    // Retornar URL da imagem
    return {
      success: true,
      url: `/products/${filename}`,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao fazer upload da imagem',
    });
  }
});