import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center px-[16px]">
      <h1 className="display">404</h1>
      <p className="mt-[48px] text-fog-gray">
        Bunday sahifa topilmadi.
      </p>
      <Link href="/" className="mt-[16px] inline-flex items-center gap-[8px]">
        <span className="inline-block size-[6px] rounded-full bg-scarlet-signal" />
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
