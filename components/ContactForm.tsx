"use client";

import { useState } from "react";
import Select from "@/components/Select";
import { contactSchema, serviceOptions } from "@/lib/contact";

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
        <Select
          name="service"
          placeholder="Xizmat turi"
          options={serviceOptions}
          invalid={!!errors.service}
        />
        {errors.service && <p className="mt-[8px] text-scarlet-signal">{errors.service}</p>}
      </div>
      <div className="pt-[16px]">
        <button type="submit" disabled={status === "sending"} className="btn-fill inline-flex cursor-pointer items-center gap-[8px] border border-graphite px-[16px] py-[8px] disabled:opacity-50">
          <span className="inline-block size-[6px] rounded-full bg-scarlet-signal" />
          <span>{status === "sending" ? "Yuborilmoqda…" : "Yuborish"}</span>
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
