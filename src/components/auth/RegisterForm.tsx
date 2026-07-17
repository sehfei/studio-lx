"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { signUpCustomer } from "@/app/(site)/register/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function RegisterForm({
  t,
  redirectTo,
}: {
  t: Dictionary;
  redirectTo: string;
}) {
  const [state, formAction, pending] = useActionState(
    signUpCustomer,
    undefined,
  );

  if (state?.needsEmailConfirm) {
    return (
      <p
        className="border border-gold/40 bg-gold/5 px-4 py-3 text-center text-sm text-gold"
        style={{ borderRadius: "var(--radius)" }}
      >
        {t.auth.needsEmailConfirm}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <input
        className="input-theme"
        placeholder={t.auth.name}
        name="name"
        autoComplete="name"
        required
      />
      <input
        className="input-theme"
        placeholder={t.auth.email}
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <input
        className="input-theme"
        placeholder={t.auth.password}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? t.auth.registering : t.auth.register}
      </button>
    </form>
  );
}
