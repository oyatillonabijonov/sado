import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * The panel's session layer.
 *
 * Payload stays underneath the custom admin as the database, the auth, the
 * media pipeline and the three-locale content model — the studio never opens
 * `/admin` again, but nothing about how the data is stored changed. That is the
 * whole trade: the surface is ours, the hard parts are not rewritten.
 *
 * Sessions are Payload's own JWT cookie, so `/admin` and `/panel` are the same
 * login. Nothing here invents a second notion of "signed in".
 */

export const payloadClient = () => getPayload({ config });

export async function currentUser() {
  const payload = await payloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  return user;
}

/**
 * Whether the panel has any account at all — the gate on the first-user screen.
 *
 * It lives here, in a `'server-only'` module, rather than beside the action it
 * guards: every export of a `'use server'` file *is* an HTTP endpoint, and this
 * one would answer "does this installation have an admin yet" to anyone asking.
 */
export async function hasAnyUser() {
  const payload = await payloadClient();
  const { totalDocs } = await payload.count({ collection: 'users' });
  return totalDocs > 0;
}

/** Every panel screen starts with this. Unauthenticated → the login page. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/panel/login');
  return user;
}
