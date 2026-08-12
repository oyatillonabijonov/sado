import Link from "@/components/LocaleLink";

/** Red dot + white text — the system's only button. */
export default function RedDotLink({
  href,
  children,
  as = "link",
}: {
  href?: string;
  children: React.ReactNode;
  as?: "link" | "button";
}) {
  const box =
    "btn-fill inline-flex items-center gap-[8px] border border-graphite px-[16px] py-[8px]";
  const inner = (
    <>
      <span
        aria-hidden
        className="block size-[6px] shrink-0 rounded-full bg-scarlet-signal"
      />
      <span>{children}</span>
    </>
  );
  if (as === "button" || !href) {
    return (
      <button type="submit" className={`cursor-pointer ${box}`}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href} className={box}>
      {inner}
    </Link>
  );
}
