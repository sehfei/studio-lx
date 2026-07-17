"use client";

import { useActionState } from "react";
import type { PageKey, SitePages } from "@/lib/pages";
import { Spinner } from "@/components/ui/Spinner";
import { savePages } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

const cardClass =
  "rounded-2xl border border-border-subtle bg-background p-6 shadow-sm";
const labelClass =
  "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";
const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm outline-none focus:border-gold";

function PageEditor({
  keyName,
  heading,
  hint,
  initial,
  dict,
}: {
  keyName: PageKey;
  heading: string;
  hint: string;
  initial: SitePages[keyof SitePages];
  dict: AdminDictionary["settings"]["pagesForm"];
}) {
  return (
    <div className={cardClass}>
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
        {heading}
      </p>
      <p className="mb-4 text-xs text-foreground/40">{hint}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{dict.titleEnLabel}</label>
          <input
            name={`${keyName}-titleEn`}
            defaultValue={initial.titleEn}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.titleZhLabel}</label>
          <input
            name={`${keyName}-titleZh`}
            defaultValue={initial.titleZh}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.bodyEnLabel}</label>
          <textarea
            name={`${keyName}-bodyEn`}
            rows={6}
            defaultValue={initial.bodyEn}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.bodyZhLabel}</label>
          <textarea
            name={`${keyName}-bodyZh`}
            rows={6}
            defaultValue={initial.bodyZh}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

export function PagesForm({
  initial,
  dict,
  common,
}: {
  initial: SitePages;
  dict: AdminDictionary["settings"]["pagesForm"];
  common: AdminDictionary["common"];
}) {
  const [state, formAction, pending] = useActionState(savePages, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-2xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">
          {state.success}
        </p>
      )}

      <PageEditor
        keyName="about"
        heading={dict.aboutHeading}
        hint={dict.defaultHint}
        initial={initial.about}
        dict={dict}
      />
      <PageEditor
        keyName="shipping"
        heading={dict.shippingHeading}
        hint={dict.defaultHint}
        initial={initial.shipping}
        dict={dict}
      />
      <PageEditor
        keyName="privacy"
        heading={dict.privacyHeading}
        hint={dict.legalDefaultHint}
        initial={initial.privacy}
        dict={dict}
      />
      <PageEditor
        keyName="terms"
        heading={dict.termsHeading}
        hint={dict.legalDefaultHint}
        initial={initial.terms}
        dict={dict}
      />

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? common.saving : dict.saveButton}
      </button>
    </form>
  );
}
