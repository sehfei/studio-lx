import type { Metadata } from "next";
import { getIdentity } from "@/lib/identity";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const [identity, { t }] = await Promise.all([getIdentity(), getI18n()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.contact.title}</h1>
      <div className="space-y-4 text-sm text-foreground/70">
        <p>
          {t.contact.whatsapp}：+{identity.whatsappNumber}
        </p>
        <p>{t.contact.email}：hello@studiolx.example.com</p>
        <p>
          {t.contact.hours}：{t.contact.hoursValue}
        </p>
      </div>
      <form className="mt-10 space-y-4">
        <input
          className="input-theme"
          placeholder={t.contact.yourName}
          disabled
        />
        <input
          className="input-theme"
          placeholder={t.contact.yourEmail}
          disabled
        />
        <textarea
          className="input-theme"
          rows={5}
          placeholder={t.contact.message}
          disabled
        />
        <button className="btn-primary" disabled>
          {t.contact.send}
        </button>
        <p className="text-xs text-foreground/40">
          {t.contact.formComingSoon}
        </p>
      </form>
    </div>
  );
}
