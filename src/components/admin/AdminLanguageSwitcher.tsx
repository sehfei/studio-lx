"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { setAdminLocale } from "@/lib/i18n/actions";

// 后台语言切换按钮。逻辑同前台 LanguageSwitcher，但调用 setAdminLocale
// （写 admin_locale cookie），只影响后台。
export function AdminLanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = (locale: Locale) => {
    if (locale === current || pending) return;
    startTransition(async () => {
      await setAdminLocale(locale);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 text-xs" aria-label="Language">
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span className="text-foreground/30">/</span>}
          <button
            type="button"
            onClick={() => switchTo(locale)}
            disabled={pending}
            className={
              locale === current
                ? "font-medium text-gold"
                : "text-foreground/60 hover:text-gold"
            }
            aria-current={locale === current ? "true" : undefined}
          >
            {LOCALE_LABELS[locale]}
          </button>
        </span>
      ))}
    </div>
  );
}
