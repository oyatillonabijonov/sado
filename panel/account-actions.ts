'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generatePayloadCookie } from 'payload/shared';
import { payloadClient, requireUser } from '@/panel/auth';
import { explain, type FormState } from '@/panel/form-state';

/**
 * The two account operations Payload's own `/admin` used to carry. That
 * directory is gone — Payload's guidance for switching the admin panel off is
 * to delete it, not to set a flag — so the first-user screen and the password
 * change had to move here or stop existing.
 *
 * Both go through Payload's **local** API, never `/api/users`. That matters:
 * the REST auth routes are blocked at the edge, and the panel keeps working
 * because it never used them in the first place.
 */

const MIN_PASSWORD = 10;

/** Shared by both actions — the one rule worth enforcing at this boundary. */
function checkPassword(password: string, repeat: string): string | null {
  if (password.length < MIN_PASSWORD) return `Parol kamida ${MIN_PASSWORD} ta belgidan iborat bo‘lsin.`;
  if (password !== repeat) return 'Ikkala parol bir xil emas.';
  return null;
}

/* ----------------------------------------------------------- first user -- */

/**
 * Create the very first account, and only that.
 *
 * The count is re-read here rather than trusted from the page: an action is its
 * own HTTP entry point, reachable by anyone who knows its id long after the
 * screen that contained it stopped rendering. Once one user exists this is a
 * closed door, exactly like Payload's own `create-first-user`.
 */
export async function createFirstUser(_prev: FormState, fd: FormData): Promise<FormState> {
  const payload = await payloadClient();
  const { totalDocs } = await payload.count({ collection: 'users' });
  if (totalDocs > 0) return { error: 'Hisob allaqachon yaratilgan. Kirish sahifasidan foydalaning.' };

  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const name = String(fd.get('name') ?? '').trim();

  if (!email) return { error: 'Emailni kiriting.' };
  const bad = checkPassword(password, String(fd.get('repeat') ?? ''));
  if (bad) return { error: bad };

  try {
    await payload.create({ collection: 'users', data: { email, password, name: name || email.split('@')[0] } });
  } catch (error) {
    return { error: explain(error) };
  }

  redirect('/panel/login');
}

/* ------------------------------------------------------- change password -- */

/**
 * Change your own password. The current one is required and is checked by
 * actually logging in with it — Payload has no "verify this password" call, and
 * a form that changes a password on the strength of a cookie alone hands the
 * account to anyone who walks past an unlocked screen.
 */
export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();

  const current = String(fd.get('current') ?? '');
  const password = String(fd.get('password') ?? '');

  const bad = checkPassword(password, String(fd.get('repeat') ?? ''));
  if (bad) return { error: bad };

  const payload = await payloadClient();

  let token: string | undefined;
  try {
    ({ token } = await payload.login({
      collection: 'users',
      data: { email: user.email, password: current },
    }));
  } catch {
    return { error: 'Hozirgi parol noto‘g‘ri.' };
  }

  try {
    await payload.update({ collection: 'users', id: user.id, data: { password } });
  } catch (error) {
    return { error: explain(error) };
  }

  // Payload issues a fresh token on the password change; the cookie still holds
  // the old one. Re-stamping it here is what keeps the studio signed in instead
  // of being bounced to the login screen by their own successful change.
  if (token) await writeSessionCookie(token);

  return { ok: true };
}

async function writeSessionCookie(token: string) {
  const payload = await payloadClient();
  const cookie = generatePayloadCookie({
    collectionAuthConfig: payload.collections.users.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  });

  (await cookies()).set(cookie.name, cookie.value ?? '', {
    httpOnly: true,
    path: '/',
    sameSite: (cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') ?? 'lax',
    secure: cookie.secure,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
  });
}
