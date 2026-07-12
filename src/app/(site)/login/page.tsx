import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8 text-center">{t.auth.login}</h1>
      <form className="space-y-4">
        <input className="input-theme" placeholder={t.auth.email} disabled />
        <input
          className="input-theme"
          placeholder={t.auth.password}
          type="password"
          disabled
        />
        <button className="btn-primary w-full" disabled>
          {t.auth.login}
        </button>
        <button className="btn-outline w-full" disabled type="button">
          {t.auth.continueWithGoogle}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-foreground/40">
        {t.auth.comingSoon}
      </p>
      <p className="mt-4 text-center text-sm">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="text-gold">
          {t.auth.register}
        </Link>
      </p>
    </div>
  );
}
