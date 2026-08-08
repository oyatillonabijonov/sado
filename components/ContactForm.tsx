"use client";

import { useState } from "react";
import Select from "@/components/Select";
import { contactSchema, serviceOptions } from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<string, string>>;

/* Har bir maydon o'z ramkasiga olindi: pastki chiziqli variant kulrang kartada
   yo'qolib ketardi va forma "tekis" ko'rinardi. */
const field =
  "w-full rounded-[10px] bg-pure-black px-[16px] py-[16px] text-bone-white outline-none ring-1 ring-transparent transition-shadow placeholder:text-fog-gray focus:ring-bone-white";

/* Formani sahifadan ajratib turadigan to'rtburchak. Ikkala joyda ham (bosh sahifa
   CTA va /contact) bir xil bo'lishi uchun sahifada emas, shu yerda. */
const card = "rounded-[10px] bg-soft-black p-[24px] sm:p-[40px]";

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
      <div className={card}>
        <p className="text-subheading text-bone-white">Xabaringiz yuborildi.</p>
        <p className="mt-[16px] text-fog-gray">
          Bir ish kuni ichida siz bilan bog'lanamiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`${card} flex flex-col gap-[16px]`}>
      {(
        [
          ["name", "Ismingiz", "text"],
          ["phone", "Telefon", "tel"],
          ["company", "Kompaniya (ixtiyoriy)", "text"],
        ] as const
      ).map(([name, label, type]) => (
        <div key={name} className="flex flex-col gap-[8px]">
          {/* Ko'rinadigan yorliq: placeholder yozuv kirgach yo'qoladi va maydon
              nima uchun ekani bilinmay qoladi. */}
          <label htmlFor={`contact-${name}`} className="text-fog-gray">
            {label}
          </label>
          <input
            id={`contact-${name}`}
            name={name}
            type={type}
            className={field}
            aria-invalid={!!errors[name]}
          />
          {errors[name] && <p className="text-scarlet-signal">{errors[name]}</p>}
        </div>
      ))}
      <div className="flex flex-col gap-[8px]">
        <span className="text-fog-gray">Xizmat turi</span>
        <Select
          name="service"
          placeholder="Tanlang"
          options={serviceOptions}
          invalid={!!errors.service}
        />
        {errors.service && <p className="text-scarlet-signal">{errors.service}</p>}
      </div>
      <div className="pt-[16px]">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-fill inline-flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[10px] border border-graphite px-[16px] py-[16px] text-subheading disabled:opacity-50 sm:w-auto sm:px-[32px]"
        >
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
