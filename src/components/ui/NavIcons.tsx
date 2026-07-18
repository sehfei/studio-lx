// 跟 WishlistButton.tsx 里的心形图标同一套风格：
// viewBox 24x24、线性描边、currentColor，方便跟着文字色/主题色走。
// 描边粗细走 --icon-stroke-width（后台"图标粗细"设置），不写死。

type IconProps = { className?: string };

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </svg>
  );
}

export function CartIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h2l1.6 10.4A2 2 0 0 0 8.57 18H18a2 2 0 0 0 1.97-1.65L21.5 8H6" />
      <circle cx="9.5" cy="21" r="1" />
      <circle cx="17.5" cy="21" r="1" />
    </svg>
  );
}

export function AccountIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.5 11.5c0-.9.4-1.7 1.1-2.3l5.6-4.7c.5-.4 1.2-.4 1.6 0l5.6 4.7c.7.6 1.1 1.4 1.1 2.3V18a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2v-6.5Z" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4c2 3.3 2 12.7 0 16" />
      <path d="M5 10.5h14" />
    </svg>
  );
}

export function LogoutIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.5 4.5H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h5.5" />
      <path d="M9.5 12H20" />
      <path d="M16.5 8.5 20 12l-3.5 3.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function WishlistIcon({ className = "h-5 w-5", filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      style={{ strokeWidth: "var(--icon-stroke-width, 1.5)" }}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.7-10-9.3C0.3 8.1 2 4.5 5.6 4c2-.3 3.9.7 4.9 2.3.9-1.6 2.9-2.6 4.9-2.3 3.6.5 5.3 4.1 3.6 7.7C19.5 16.3 12 21 12 21z" />
    </svg>
  );
}
