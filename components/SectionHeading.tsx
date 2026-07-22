/** Section opener: hairline rule, small gray kicker, calm heading. */
export default function SectionHeading({
  children,
  kicker,
}: {
  children: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div className="mb-[64px] border-t border-graphite pt-[20px]">
      {kicker && <p className="mb-[40px] text-fog-gray">{kicker}</p>}
      <h2 className="heading">{children}</h2>
    </div>
  );
}
