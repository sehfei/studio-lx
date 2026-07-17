"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { submitContactMessage } from "@/app/(site)/contact/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactForm({ t }: { t: Dictionary }) {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    undefined,
  );

  if (state?.success) {
    return (
      <p
        className="mt-10 border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold"
        style={{ borderRadius: "var(--radius)" }}
      >
        {t.contact.sendSuccess}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-10 space-y-4">
      {/* 蜜罐字段：真人看不到也不会填，爬虫/脚本经常无脑填所有输入框。
          不用 type="hidden"，那种爬虫反而会跳过；用 CSS 藏起来才有效。 */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <input
        name="name"
        required
        className="input-theme"
        placeholder={t.contact.yourName}
      />
      <input
        name="email"
        type="email"
        required
        className="input-theme"
        placeholder={t.contact.yourEmail}
      />
      <textarea
        name="message"
        required
        rows={5}
        className="input-theme"
        placeholder={t.contact.message}
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? t.contact.sending : t.contact.send}
      </button>
    </form>
  );
}
