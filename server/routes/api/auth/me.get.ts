import { readCookie } from '../../utils/cookies';

export default async function me(req, res) {
  const authToken = readCookie(req, 'authToken');

  if (!authToken) {
    return res.status(401).json({ status: 'não autenticado' });
  }

  // In a real app, this would query the database to get user data
  const user = { id: '123', name: 'John Doe' };

  res.json({ status: 'autenticado', user });
}