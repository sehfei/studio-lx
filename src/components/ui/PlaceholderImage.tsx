export function PlaceholderImage({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-[3/4] w-full items-center justify-center border border-border-subtle bg-[repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5_10px,#fafafa_10px,#fafafa_20px)] ${className}`}
    >
      <span className="px-4 text-center text-xs tracking-widest text-foreground/40 uppercase">
        {label ?? "Image Coming Soon"}
      </span>
    </div>
  );
}
