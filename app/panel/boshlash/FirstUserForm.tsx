'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createFirstUser } from '@/panel/account-actions';
import type { FormState } from '@/panel/form-state';
import { Field } from '@/panel/ui';

export function FirstUserForm() {
  const [state, action] = useActionState<FormState, FormData>(createFirstUser, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      <Field label="Email" name="email" type="email" required placeholder="siz@example.uz" />
      <Field label="Ismingiz" name="name" />
      <Field
        label="Parol"
        hint="Kamida 10 ta belgi."
        name="password"
        type="password"
        required
        placeholder="••••••••••"
      />
      <Field label="Parolni takrorlang" name="repeat" type="password" required placeholder="••••••••••" />

      {state.error && <p className="text-body-sm text-ember">{state.error}</p>}

      <Submit />
    </form>
  );
}

/** `useFormStatus` reads the enclosing form, so the button is its own component. */
function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-14 items-center justify-center rounded-pill bg-obsidian px-8 text-body text-white transition duration-200 ease-fluid hover:bg-pebble active:scale-[0.97] active:duration-100 disabled:bg-mist disabled:text-driftwood"
    >
      {pending ? 'Yaratilmoqda…' : 'Hisob yaratish'}
    </button>
  );
}
