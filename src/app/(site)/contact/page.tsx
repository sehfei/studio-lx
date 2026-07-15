import type { Metadata } from "next";
import { getIdentity } from "@/lib/identity";
import { getI18n } from "@/lib/i18n/dictionaries";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [identity, { t }] = await Promise.all([getIdentity(), getI18n()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.contact.title}</h1>
      <div className="space-y-4 text-sm text-foreground/70">
        <p>
          {t.contact.whatsapp}：+{identity.whatsappNumber}
        </p>
        <p>
          {t.contact.hours}：{t.contact.hoursValue}
        </p>
      </div>
      <ContactForm t={t} />
    </div>
  );
}
