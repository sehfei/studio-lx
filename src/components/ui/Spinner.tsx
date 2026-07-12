const SIZES = {
  sm: { dot: "h-1.5 w-1.5", gap: "gap-1" },
  md: { dot: "h-2 w-2", gap: "gap-1.5" },
  lg: { dot: "h-2.5 w-2.5", gap: "gap-2" },
} as const;

// 三点跳动 loader，颜色跟随当前文字色（放深色按钮里用 currentColor 自动变白）
export function Spinner({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { dot, gap } = SIZES[size];
  return (
    <span
      role="status"
      aria-label="加载中"
      className={`inline-flex items-center ${gap} ${className}`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${dot} animate-bounce-dot rounded-full bg-current`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
