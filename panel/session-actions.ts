'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateExpiredPayloadCookie, generatePayloadCookie } from 'payload/shared';
import { payloadClient } from '@/panel/auth';

export type SignInState = { error?: string };

/**
 * Sign in through Payload's own local login, then write Payload's own cookie.
 *
 * `generatePayloadCookie` rather than a hand-written `cookies().set`: the cookie
 * name, sameSite, secure flag and expiry all come off the collection's auth
 * config, so a change there (a longer session, a cookie domain in production)
 * reaches this panel without anyone remembering it exists.
 */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Email va parolni kiriting.' };

  const payload = await payloadClient();
  let token: string | undefined;

  try {
    ({ token } = await payload.login({ collection: 'users', data: { email, password } }));
  } catch {
    // Payload distinguishes "no such user", "wrong password" and "locked".
    // The panel does not: telling a stranger which email exists is the whole
    // reason that distinction is not surfaced on a login screen.
    return { error: 'Email yoki parol noto‘g‘ri.' };
  }

  if (!token) return { error: 'Kirish imkoni bo‘lmadi. Qaytadan urinib ko‘ring.' };

  const cookie = generatePayloadCookie({
    collectionAuthConfig: payload.collections.users.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  });

  const store = await cookies();
  store.set(cookie.name, cookie.value ?? '', {
    httpOnly: true,
    path: '/',
    sameSite: (cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') ?? 'lax',
    secure: cookie.secure,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
  });

  // Outside the try — `redirect` works by throwing, and a catch above would
  // swallow it and report a login failure that already succeeded.
  redirect('/panel');
}

export async function signOut() {
  const payload = await payloadClient();
  const cookie = generateExpiredPayloadCookie({
    collectionAuthConfig: payload.collections.users.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
  });

  (await cookies()).delete(cookie.name);
  redirect('/panel/login');
}
