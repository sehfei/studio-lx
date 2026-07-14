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
      className="-m-2 flex items-center gap-1.5 p-2"
      aria-label="Language / 语言"
    >
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-foreground/25">/</span>}
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
