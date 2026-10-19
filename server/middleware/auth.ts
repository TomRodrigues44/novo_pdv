import { getRequestPath } from 'h3';
import { getSessionUser, type UserRole } from '../lib/auth';

const publicRoutes = new Set([
  '/api/auth/status',
  '/api/auth/bootstrap',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
]);

const cashierRoutes = [
  '/api/products',
  '/api/categories',
  '/api/customers',
  '/api/motoboys',
  '/api/cash-register',
  '/api/cash-transactions',
  '/api/sales',
  '/api/nfce',
  '/api/fiscal/company-config',
  '/api/fiscal/xml-export',
  '/api/reports',
  '/api/nfe/emitir',
  '/api/xmls',
  '/api/contingency',
  '/api/kitchen',
  '/api/cancel-password',
  '/api/nfe',
];

const managerRoutes = [
  ...cashierRoutes,
  '/api/fiscal/certificates',
  '/api/fiscal/test-connection',
  '/api/upload',
  '/api/cancel-password',
];

function isAllowed(path: string, role: UserRole) {
  if (role === 'admin') return true;

  const allowedRoutes =
    role === 'manager' ? managerRoutes : cashierRoutes;

  return allowedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

export default defineEventHandler(async (event) => {
  // A autorização deve considerar somente o caminho da rota,
  // sem parâmetros de consulta como ?inicio=...&fim=...
  const requestPath = getRequestPath(event);
  const path = requestPath.split('?')[0];

  if (!path.startsWith('/api/') || publicRoutes.has(path)) return;

  const user = await getSessionUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Faça login para continuar.',
    });
  }

  if (!isAllowed(path, user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seu perfil não possui acesso a este recurso.',
    });
  }

  event.context.authUser = user;
});
