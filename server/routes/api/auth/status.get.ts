import { getCookie } from 'h3';
import { createError } from 'h3';

export default async function handler(req: any, res: any) {
  const token = getCookie(req, 'authToken');
  if (!token) {
    return res.status(401).json({ status: 'not authenticated' });
  }

  // In a real app you would verify the token against a DB.
  // For this demo we return a dummy user.
  const user = {
    id: '1',
    name: 'John Doe',
    username: 'john.doe',
    role: 'cashier' as const,
    roleLabel: 'Administrador',
    active: true,
  };

  return res.status(200).json({
    status: 'authenticated',
    user,
  });
}