export function PlaceholderImage({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-[3/4] w-full items-center justify-center border border-border-subtle bg-foreground/3 ${className}`}
      style={{ borderRadius: "var(--radius)" }}
    >
      <span className="flex flex-col items-center gap-3 px-4 text-center">
        <span className="h-px w-8 bg-foreground/20" aria-hidden />
        <span className="text-xs tracking-[0.2em] text-foreground/40 uppercase">
          {label ?? "Image Coming Soon"}
        </span>
        <span className="h-px w-8 bg-foreground/20" aria-hidden />
      </span>
    </div>
  );
}
