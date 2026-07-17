"use client";

import { en } from "@/lib/i18n/dictionaries/en";
import { zh } from "@/lib/i18n/dictionaries/zh";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

// 错误边界是 client component，读不了 next/headers 的 cookies()，
// 直接解析 document.cookie 拿 locale。
function readLocaleClient() {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : undefined;
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  return locale === "zh" ? zh : en;
}

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  const t = readLocaleClient();
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8">
      <h1 className="section-title mb-6">{t.common.errorTitle}</h1>
      <p className="mb-8 text-sm text-foreground/50">{t.common.errorBody}</p>
      <button className="btn-primary" onClick={reset}>
        {t.common.retry}
      </button>
    </div>
  );
}
