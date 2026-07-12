import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8 text-center">{t.auth.register}</h1>
      <form className="space-y-4">
        <input
          className="input-theme"
          placeholder={t.contact.yourName}
          disabled
        />
        <input className="input-theme" placeholder={t.auth.email} disabled />
        <input
          className="input-theme"
          placeholder={t.auth.password}
          type="password"
          disabled
        />
        <button className="btn-primary w-full" disabled>
          {t.auth.register}
        </button>
        <button className="btn-outline w-full" disabled type="button">
          {t.auth.continueWithGoogle}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-foreground/40">
        {t.auth.comingSoon}
      </p>
      <p className="mt-4 text-center text-sm">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="text-gold">
          {t.auth.login}
        </Link>
      </p>
    </div>
  );
}
