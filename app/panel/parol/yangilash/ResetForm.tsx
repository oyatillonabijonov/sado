"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/panel/form-state";
import { applyReset } from "@/panel/reset-actions";
import { Submit } from "../ForgotForm";
import { Field } from "@/panel/ui";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(applyReset, {});

  if (state.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body">Parol yangilandi.</p>
        <Link
          href="/panel/login"
          className="inline-flex min-h-14 w-fit items-center rounded-pill bg-obsidian px-8 text-body text-white transition hover:bg-pebble"
        >
          Kirish
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="token" value={token} />
      <Field
        label="Yangi parol"
        hint="Kamida 10 ta belgi."
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="••••••••••"
      />
      <Field
        label="Parolni takrorlang"
        name="repeat"
        type="password"
        required
        autoComplete="new-password"
        placeholder="••••••••••"
      />
      {state.error && <p className="text-body-sm text-ember">{state.error}</p>}
      <Submit label="Parolni saqlash" pendingLabel="Saqlanmoqda…" />
    </form>
  );
}
