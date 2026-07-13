import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/dictionaries";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { t } = await getI18n();
  const { redirect } = await searchParams;
  const redirectTo = safeRedirectPath(redirect);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8 text-center">{t.auth.login}</h1>
      {redirectTo === "/checkout" && (
        <p className="mb-6 text-center text-sm text-foreground/60">
          {t.auth.checkoutLoginPrompt}
        </p>
      )}
      <LoginForm t={t} redirectTo={redirectTo} />
      <p className="mt-4 text-center text-sm">
        {t.auth.noAccount}{" "}
        <Link
          href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="text-gold"
        >
          {t.auth.register}
        </Link>
      </p>
    </div>
  );
}
