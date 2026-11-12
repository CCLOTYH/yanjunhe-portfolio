const segmentClasses = [
  "bg-rpm-1",
  "bg-rpm-2",
  "bg-rpm-3",
  "bg-rpm-4",
  "bg-rpm-5",
];

export function LanguageRating({ name, score }: { name: string; score: number }) {
  return (
    <div
      role="img"
      aria-label={`${name} proficiency: ${score} out of 5`}
      className="flex items-center gap-1.5"
    >
      {segmentClasses.map((segmentClass, index) => (
        <span
          key={segmentClass}
          aria-hidden
          className={`block h-4 w-9 -skew-x-12 ${
            index < score ? segmentClass : "bg-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}
