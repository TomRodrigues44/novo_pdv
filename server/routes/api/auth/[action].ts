import crypto from 'node:crypto';
import {
  clearSession,
  createSession,
  ensureAuthSchema,
  getSessionUser,
  hashPassword,
  normalizeUsername,
  requireRole,
  roleLabels,
  type UserRole,
  validatePassword,
  verifyPassword,
} from '../../../lib/auth';
import { sql } from '../../../utils/db';

const validRoles: UserRole[] = ['admin', 'manager', 'cashier'];

const publicUser = (user: any) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
  roleLabel: roleLabels[user.role as UserRole],
  active: user.active,
  created_at: user.created_at,
});

export default defineEventHandler(async (event) => {
  await ensureAuthSchema();
  const action = getRouterParam(event, 'action');

  if (action === 'status') {
    const users = await sql`SELECT COUNT(*)::int AS count FROM app_users`;
    return { configured: Number(users[0].count) > 0 };
  }

  if (action === 'bootstrap') {
    const users = await sql`SELECT COUNT(*)::int AS count FROM app_users`;
    if (Number(users[0].count) > 0) {
      throw createError({ statusCode: 403, statusMessage: 'O administrador inicial já foi configurado.' });
    }

    const body = await readBody(event);
    const name = String(body.name ?? '').trim();
    const username = normalizeUsername(body.username);
    const password = validatePassword(body.password);

    if (!name || username.length < 3) {
      throw createError({ statusCode: 400, statusMessage: 'Informe nome e usuário com pelo menos 3 caracteres.' });
    }

    const id = `user-${crypto.randomUUID()}`;
    await sql`
      INSERT INTO app_users (id, name, username, password_hash, role)
      VALUES (${id}, ${name}, ${username}, ${await hashPassword(password)}, 'admin')
    `;
    await createSession(event, id);
    return { user: { id, name, username, role: 'admin', roleLabel: 'Administrador', active: true } };
  }

  if (action === 'login') {
    const body = await readBody(event);
    const username = normalizeUsername(body.username);
    const password = String(body.password ?? '');
    const users = await sql`
      SELECT * FROM app_users
      WHERE username = ${username} AND active = true
      LIMIT 1
    `;
    const user = users[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw createError({ statusCode: 401, statusMessage: 'Usuário ou senha inválidos.' });
    }

    await createSession(event, user.id);
    return { user: publicUser(user) };
  }

  if (action === 'logout') {
    await clearSession(event);
    return { success: true };
  }

  const currentUser = await getSessionUser(event);
  if (action === 'me') return { user: currentUser };

  requireRole(currentUser, ['admin']);

  if (action === 'users' && event.method === 'GET') {
    const users = await sql`
      SELECT id, name, username, role, active, created_at
      FROM app_users
      ORDER BY created_at ASC
    `;
    return users.map(publicUser);
  }

  if (action === 'users' && event.method === 'POST') {
    const body = await readBody(event);
    const name = String(body.name ?? '').trim();
    const username = normalizeUsername(body.username);
    const password = validatePassword(body.password);
    const role = body.role as UserRole;

    if (!name || username.length < 3 || !validRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Preencha os dados do usuário corretamente.' });
    }

    const id = `user-${crypto.randomUUID()}`;
    const result = await sql`
      INSERT INTO app_users (id, name, username, password_hash, role)
      VALUES (${id}, ${name}, ${username}, ${await hashPassword(password)}, ${role})
      RETURNING id, name, username, role, active, created_at
    `;
    return publicUser(result[0]);
  }

  if (action === 'users' && event.method === 'PUT') {
    const body = await readBody(event);
    const id = String(body.id ?? '');
    const name = String(body.name ?? '').trim();
    const role = body.role as UserRole;
    const active = Boolean(body.active);

    if (!id || !name || !validRoles.includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Dados inválidos para atualização.' });
    }
    if (id === currentUser?.id && !active) {
      throw createError({ statusCode: 400, statusMessage: 'Você não pode desativar seu próprio acesso.' });
    }

    if (body.password) {
      await sql`
        UPDATE app_users
        SET name = ${name}, role = ${role}, active = ${active},
            password_hash = ${await hashPassword(validatePassword(body.password))},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE app_users
        SET name = ${name}, role = ${role}, active = ${active}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    }
    return { success: true };
  }

  throw createError({ statusCode: 404, statusMessage: 'Ação não encontrada.' });
});