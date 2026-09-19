import RedDotLink from "@/components/RedDotLink";

/**
 * Ro'yxat bo'sh bo'lganda ko'rinadi.
 *
 * Sayt nol loyiha va nol maqola bilan ochiladi — kontentni mijoz panelidan
 * o'zi qo'shadi. Busiz sarlavha bilan futer orasida katta bo'sh joy qolib,
 * sahifa buzilgandek ko'rinardi.
 */
export default function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-[16px] rounded-base border border-dashed border-graphite px-[16px] py-[120px] text-center">
      <p className="text-subheading text-bone-white">{title}</p>
      {hint && <p className="max-w-[46ch] text-fog-gray">{hint}</p>}
      {action && (
        <div className="mt-[16px]">
          <RedDotLink href={action.href}>{action.label}</RedDotLink>
        </div>
      )}
    </div>
  );
}
