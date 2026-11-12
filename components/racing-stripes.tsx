export function RacingStripes({
  dark = false,
  className = "",
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className={`flex items-center gap-1.5 ${className}`}>
      <span className="block h-1.5 w-8 -skew-x-12 bg-racing-orange" />
      <span className="block h-1.5 w-8 -skew-x-12 bg-racing-red" />
      <span
        className={`block h-1.5 w-8 -skew-x-12 ${dark ? "bg-white" : "bg-navy"}`}
      />
    </div>
  );
}
