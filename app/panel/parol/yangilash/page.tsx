import type { Metadata } from "next";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Yangi parol", robots: { index: false } };

/** Token xatdagi havoladan keladi: /panel/parol/yangilash?token=… */
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[26rem] flex-col justify-center gap-8 px-6">
      <h1 className="text-heading">Yangi parol</h1>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-body text-pebble">
          Havola to‘liq emas. Xatdagi havolani to‘liq oching yoki qaytadan so‘rang.
        </p>
      )}
    </main>
  );
}
