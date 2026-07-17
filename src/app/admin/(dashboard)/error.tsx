"use client";

import { en } from "@/lib/i18n/admin/en";
import { zh } from "@/lib/i18n/admin/zh";
import { ADMIN_DEFAULT_LOCALE, ADMIN_LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

// 错误边界是 client component，读不了 next/headers 的 cookies()，
// 直接解析 document.cookie 拿 admin_locale。
function readAdminLocaleClient() {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ADMIN_LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : undefined;
  const locale = isLocale(value) ? value : ADMIN_DEFAULT_LOCALE;
  return locale === "zh" ? zh : en;
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const dict = readAdminLocaleClient();
  return (
    <div className="py-16 text-center">
      <h1 className="mb-4 text-lg font-semibold">{dict.common.backendError}</h1>
      <p className="mb-8 text-sm text-foreground/50">{error.message}</p>
      <button className="btn-primary" onClick={reset}>
        {dict.common.retry}
      </button>
    </div>
  );
}
