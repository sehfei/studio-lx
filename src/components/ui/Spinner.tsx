"use client";

import { useEffect, useState } from "react";
import { LOCALE_COOKIE, ADMIN_LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { zh } from "@/lib/i18n/dictionaries/zh";
import { en as adminEn } from "@/lib/i18n/admin/en";
import { zh as adminZh } from "@/lib/i18n/admin/zh";

const SIZES = {
  sm: { dot: "h-1.5 w-1.5", gap: "gap-1" },
  md: { dot: "h-2 w-2", gap: "gap-1.5" },
  lg: { dot: "h-2.5 w-2.5", gap: "gap-2" },
} as const;

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Spinner 在前台/后台都用，两边各有一套独立的语言 cookie。用当前路径判断
// 走哪一套，读不到就退回英文——跟 error.tsx 那两个错误边界同样的兜底逻辑。
function readLoadingLabel(): string {
  if (window.location.pathname.startsWith("/admin")) {
    const value = readCookie(ADMIN_LOCALE_COOKIE);
    return isLocale(value) && value === "zh" ? adminZh.common.loading : adminEn.common.loading;
  }
  const value = readCookie(LOCALE_COOKIE);
  return isLocale(value) && value === "zh" ? zh.common.loading : en.common.loading;
}

// 三点跳动 loader，颜色跟随当前文字色（放深色按钮里用 currentColor 自动变白）
export function Spinner({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  // 首次渲染（含 SSR）先用英文兜底，挂载后再读 cookie 纠正，避免服务端/客户端不一致
  const [label, setLabel] = useState(en.common.loading);
  useEffect(() => {
    setLabel(readLoadingLabel());
  }, []);

  const { dot, gap } = SIZES[size];
  return (
    <span
      role="status"
      aria-label={label}
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
