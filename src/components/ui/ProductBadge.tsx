export function ProductBadge({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "default" | "stock";
}) {
  return (
    <span
      className={`absolute left-2 top-2 z-10 px-2 py-1 text-[10px] font-medium tracking-widest uppercase ${
        variant === "stock"
          ? "bg-muted text-background"
          : "bg-foreground text-background"
      }`}
      style={{ borderRadius: "var(--radius)" }}
    >
      {text}
    </span>
  );
}
