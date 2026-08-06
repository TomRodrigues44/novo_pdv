import crypto from 'node:crypto';
import type { H3Event } from 'h3';
import { getCookie, setCookie } from 'h3';
import { sql } from '../utils/db';

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  active: boolean;
}

const SESSION_COOKIE = 'pdv_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  cashier: 'Caixa',
};

export async function ensureAuthSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export function normalizeUsername(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

export function validatePassword(password: unknown) {
  const value = String(password ?? '');
  if (value.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A senha precisa ter pelo menos 8 caracteres.',
    });
  }
  return value;
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });

  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });

  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
}

export async function createSession(event: H3Event, userId: string) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql`
    INSERT INTO app_sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt})
  `;

  setCookie(event, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function getSessionUser(event: H3Event): Promise<AuthUser | null> {
  await ensureAuthSchema();
  const sessionId = getCookie(event, SESSION_COOKIE);
  if (!sessionId) return null;

  const result = await sql`
    SELECT u.id, u.name, u.username, u.role, u.active
    FROM app_sessions s
    INNER JOIN app_users u ON u.id = s.user_id
    WHERE s.id = ${sessionId}
      AND s.expires_at > CURRENT_TIMESTAMP
      AND u.active = true
    LIMIT 1
  `;

  return (result[0] as AuthUser | undefined) || null;
}

export async function clearSession(event: H3Event) {
  const sessionId = getCookie(event, SESSION_COOKIE);
  if (sessionId) {
    await sql`DELETE FROM app_sessions WHERE id = ${sessionId}`;
  }

  setCookie(event, SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function requireRole(user: AuthUser | null, roles: UserRole[]) {
  if (!user || !roles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Você não tem permissão para acessar este recurso.',
    });
  }
}