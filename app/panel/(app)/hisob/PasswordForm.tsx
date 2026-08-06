'use client';

import { useActionState } from 'react';
import { changePassword } from '@/panel/account-actions';
import type { FormState } from '@/panel/form-state';
import { Card, Field, SaveBar } from '@/panel/ui';

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePassword, {});

  return (
    <form action={action} className="flex flex-col gap-8">
      <Card
        title="Parolni o‘zgartirish"
        hint="Hozirgi parol ham so‘raladi — ochiq qolgan ekran hisobni bermasligi uchun."
      >
        <Field label="Hozirgi parol" name="current" type="password" required autoComplete="current-password" />
        <Field
          label="Yangi parol"
          hint="Kamida 10 ta belgi."
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <Field label="Yangi parolni takrorlang" name="repeat" type="password" required autoComplete="new-password" />
      </Card>

      {state.error && <p className="text-body text-ember">{state.error}</p>}
      <SaveBar note={state.ok ? 'Parol o‘zgartirildi.' : undefined} />
    </form>
  );
}
