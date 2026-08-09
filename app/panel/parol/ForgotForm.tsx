"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/panel/form-state";
import { requestReset } from "@/panel/reset-actions";
import { Field } from "@/panel/ui";

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(requestReset, {});

  if (state.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body">
          Agar bu email ro‘yxatda bo‘lsa, tiklash havolasi yuborildi. Pochtangizni
          tekshiring.
        </p>
        <p className="text-body-sm text-driftwood">
          Xat kelmasa spam papkasini ko‘ring yoki saytni qurgan jamoaga murojaat qiling.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <Field label="Email" name="email" type="email" required placeholder="siz@example.uz" />
      {state.error && <p className="text-body-sm text-ember">{state.error}</p>}
      <Submit label="Havola yuborish" pendingLabel="Yuborilmoqda…" />
    </form>
  );
}

export function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-14 items-center justify-center rounded-pill bg-obsidian px-8 text-body text-white transition duration-200 ease-fluid hover:bg-pebble active:scale-[0.97] disabled:bg-mist disabled:text-driftwood"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
