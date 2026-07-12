import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-10">{t.faq.title}</h1>
      <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
        {t.faq.items.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="cursor-pointer text-sm font-medium marker:content-none">
              {item.q}
            </summary>
            <p className="mt-3 text-sm text-foreground/70">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
