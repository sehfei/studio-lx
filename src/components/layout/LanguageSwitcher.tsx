"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = (locale: Locale) => {
    if (locale === current || pending) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border-subtle px-2.5 py-1 text-xs"
      aria-label="Language / 语言"
    >
      {/* 地球图标：让人一眼看出这是语言切换 */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-3.5 w-3.5 shrink-0 text-foreground/60"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" />
      </svg>
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-foreground/25">|</span>}
          <button
            type="button"
            onClick={() => switchTo(locale)}
            disabled={pending}
            className={
              locale === current
                ? "font-semibold text-gold"
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
