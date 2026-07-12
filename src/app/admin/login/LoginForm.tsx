"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input
        className="input-theme"
        placeholder="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <input
        className="input-theme"
        placeholder="Password"
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
        {pending ? "Signing in" : "Login"}
      </button>
    </form>
  );
}
