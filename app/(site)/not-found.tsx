import Link from "@/components/LocaleLink";
import { messages } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";

export default async function NotFound() {
  const m = messages(await currentLocale());

  return (
    <div className="shell flex min-h-[70vh] flex-col justify-center">
      <h1 className="display">404</h1>
      <p className="mt-[48px] text-fog-gray">{m["notFound.title"]}</p>
      <Link href="/" className="mt-[16px] inline-flex items-center gap-[8px]">
        <span className="inline-block size-[6px] rounded-full bg-scarlet-signal" />
        {m["notFound.back"]}
      </Link>
    </div>
  );
}
