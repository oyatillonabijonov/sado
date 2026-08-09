import Link from "next/link";
import type { Metadata } from "next";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Parolni tiklash", robots: { index: false } };

export default function ForgotPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[26rem] flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading">Parolni tiklash</h1>
        <p className="text-body text-pebble">
          Email manzilingizni yozing — tiklash havolasini yuboramiz.
        </p>
      </div>
      <ForgotForm />
      <Link href="/panel/login" className="text-body-sm text-pebble hover:text-obsidian">
        ← Kirish sahifasiga qaytish
      </Link>
    </main>
  );
}
