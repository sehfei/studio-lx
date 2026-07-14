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

  // 手机顶部宽度紧张（要给 logo 居中留空间），只显示当前语言，点一下切到另一种；
  // 桌面宽度够，两个语言都摆出来直接点选。
  const other = LOCALES.find((locale) => locale !== current) ?? current;

  return (
    <div className="-m-2 flex items-center p-2" aria-label="Language / 语言">
      <button
        type="button"
        onClick={() => switchTo(other)}
        disabled={pending}
        className="font-semibold text-gold sm:hidden"
      >
        {LOCALE_LABELS[current]}
      </button>

      <span className="hidden items-center gap-1.5 sm:flex">
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
      </span>
    </div>
  );
}
