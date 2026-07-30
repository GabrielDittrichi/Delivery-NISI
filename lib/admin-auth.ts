import { timingSafeEqual } from 'crypto';
import { headers } from 'next/headers';

function isValidBasicAuth(auth: string | null) {
  if (!auth?.startsWith('Basic ')) return false;

  const users = (process.env.ADMIN_USERS || process.env.ADMIN_USER || '')
    .split(',')
    .map((user) => user.trim())
    .filter(Boolean);
  const pass = process.env.ADMIN_PASS;

  if (users.length === 0 || !pass) return false;

  try {
    const decoded = Buffer.from(auth.slice('Basic '.length), 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) return false;

    const user = decoded.slice(0, idx);
    const password = decoded.slice(idx + 1);
    if (!users.includes(user)) return false;

    const passwordBuffer = Buffer.from(password);
    const expectedBuffer = Buffer.from(pass);
    return (
      passwordBuffer.length === expectedBuffer.length &&
      timingSafeEqual(passwordBuffer, expectedBuffer)
    );
  } catch {
    return false;
  }
}

export async function requireAdminAuth() {
  const requestHeaders = await headers();
  if (!isValidBasicAuth(requestHeaders.get('authorization'))) {
    throw new Error('UNAUTHORIZED_ADMIN_ACTION');
  }
}
