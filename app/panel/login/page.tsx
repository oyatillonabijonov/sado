import { redirect } from 'next/navigation';
import { currentUser } from '@/panel/auth';
import { LoginForm } from './LoginForm';

/** Already signed in → straight through, so the back button cannot park here. */
export default async function LoginPage() {
  if (await currentUser()) redirect('/panel');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center gap-10 px-4 py-16">
      <div className="flex flex-col gap-3">
        {/* Swap for the client's wordmark, or delete and put their name in text. */}
        <span className="text-heading-sm">Boshqaruv</span>
        <p className="text-body text-pebble">Sayt boshqaruvi</p>
      </div>
      <LoginForm />
    </main>
  );
}
