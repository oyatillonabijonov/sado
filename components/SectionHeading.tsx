/** 80px whisper-weight section heading with the 120px rhythm below it. */
export default function SectionHeading({
  children,
  kicker,
}: {
  children: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div className="mb-[120px]">
      {kicker && (
        <p className="mb-[16px] text-fog-gray text-body-sm">{kicker}</p>
      )}
      <h2 className="display">{children}</h2>
    </div>
  );
}
