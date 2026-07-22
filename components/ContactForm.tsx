"use client";

import { useState } from "react";
import { budgetOptions, contactSchema, serviceOptions } from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<string, string>>;

const field =
  "w-full border-0 border-b border-graphite bg-transparent py-[16px] text-bone-white placeholder:text-fog-gray focus:border-bone-white focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) fieldErrors[k] = v[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border-t border-graphite pt-[48px]">
        <p className="text-subheading text-bone-white">Xabaringiz yuborildi.</p>
        <p className="mt-[16px] text-fog-gray">
          Bir ish kuni ichida siz bilan bog'lanamiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[32px]">
      {(
        [
          ["name", "Ismingiz", "text"],
          ["email", "Email", "email"],
          ["phone", "Telefon", "tel"],
          ["company", "Kompaniya (ixtiyoriy)", "text"],
        ] as const
      ).map(([name, label, type]) => (
        <div key={name}>
          <input name={name} type={type} placeholder={label} className={field} aria-invalid={!!errors[name]} />
          {errors[name] && <p className="mt-[8px] text-scarlet-signal">{errors[name]}</p>}
        </div>
      ))}
      <div>
        <select name="service" defaultValue="" className={field} aria-invalid={!!errors.service}>
          <option value="" disabled>
            Xizmat turi
          </option>
          {serviceOptions.map((s) => (
            <option key={s} value={s} className="bg-pure-black">
              {s}
            </option>
          ))}
        </select>
        {errors.service && <p className="mt-[8px] text-scarlet-signal">{errors.service}</p>}
      </div>
      <div>
        <select name="budget" defaultValue="" className={field} aria-invalid={!!errors.budget}>
          <option value="" disabled>
            Byudjet oralig'i
          </option>
          {budgetOptions.map((b) => (
            <option key={b} value={b} className="bg-pure-black">
              {b}
            </option>
          ))}
        </select>
        {errors.budget && <p className="mt-[8px] text-scarlet-signal">{errors.budget}</p>}
      </div>
      <div>
        <textarea
          name="message"
          rows={4}
          placeholder="Loyihangiz haqida qisqacha"
          className={field}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-[8px] text-scarlet-signal">{errors.message}</p>}
      </div>
      <div className="pt-[16px]">
        <button type="submit" disabled={status === "sending"} className="inline-flex cursor-pointer items-center gap-[8px] border border-graphite px-[16px] py-[8px] transition-colors hover:border-bone-white disabled:opacity-50">
          <span className="inline-block size-[6px] rounded-full bg-scarlet-signal" />
          {status === "sending" ? "Yuborilmoqda…" : "Yuborish"}
        </button>
        {status === "error" && (
          <p className="mt-[16px] text-scarlet-signal">
            Xatolik yuz berdi. Qayta urinib ko'ring yoki bizga to'g'ridan-to'g'ri yozing.
          </p>
        )}
      </div>
    </form>
  );
}
