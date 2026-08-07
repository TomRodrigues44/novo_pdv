import { getCookie } from 'h3';
import { createError } from 'h3';

export default async function handler(req: any, res: any) {
  const token = getCookie(req, 'authToken');
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Dummy user data – replace with real lookup in production
  const user = {
    id: '1',
    name: 'John Doe',
    username: 'john.doe',
    role: 'cashier' as const,
    roleLabel: 'Caixa',
    active: true,
  };

  return res.status(200).json({ user });
}