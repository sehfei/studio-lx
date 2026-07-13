"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { signInCustomer } from "@/app/(site)/login/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm({
  t,
  redirectTo,
}: {
  t: Dictionary;
  redirectTo: string;
}) {
  const [state, formAction, pending] = useActionState(
    signInCustomer,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
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
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? t.auth.loggingIn : t.auth.login}
      </button>
    </form>
  );
}
