import type { Metadata } from "next";
import { getPages, resolvePage } from "@/lib/pages";
import { getLocale } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const [pages, locale] = await Promise.all([getPages(), getLocale()]);
  const { title, body } = resolvePage(pages, "privacy", locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-6">{title}</h1>
      <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line text-foreground/70">
        {body}
      </div>
    </div>
  );
}
