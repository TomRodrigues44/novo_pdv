import { createError } from 'h3';
import { sql } from '../../utils/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, password } = req.body as { id: string; password: string };
  if (!id || !password) {
    return res.status(400).json({ error: 'Missing id or password' });
  }

  // Fetch the sale
  const sale = await sql`SELECT * FROM sales WHERE id = ${id}`;
  if (!sale) {
    return res.status(404).json({ error: 'Sale not found' });
  }

  // Simple password check (replace with real verification)
  const expectedPassword = '123456'; // TODO: replace with real password verification
  if (password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Update sale status
  await sql`UPDATE sales SET status = 'cancelada' WHERE id = ${id}`;

  // If the sale is linked to a fiscal note, mark that note as cancelled too
  await sql`UPDATE nfce SET status = 'cancelada' WHERE sale_id = ${id}`;

  return res.status(200).json({ message: 'Cancellation successful' });
}