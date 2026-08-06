import { redirect } from 'next/navigation';
import { hasAnyUser } from '@/panel/auth';
import { FirstUserForm } from './FirstUserForm';

export const dynamic = 'force-dynamic';

/**
 * Create the first account — the screen Payload's own `/admin` used to carry,
 * and the reason deleting that directory does not brick a fresh install.
 *
 * It exists only while the installation has no users. The moment one does, this
 * is the login page and nothing else; the action behind it re-checks the same
 * count, because a form that has stopped rendering is not a form that has
 * stopped being reachable.
 */
export default async function FirstUserPage() {
  if (await hasAnyUser()) redirect('/panel/login');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center gap-10 px-4 py-16">
      <div className="flex flex-col gap-3">
        {/* Swap for the client's wordmark, or delete and put their name in text. */}
        <span className="text-heading-sm">Boshqaruv</span>
        <p className="text-body text-pebble">
          Birinchi hisobni yarating. Bu sahifa shundan keyin yopiladi.
        </p>
      </div>
      <FirstUserForm />
    </main>
  );
}
