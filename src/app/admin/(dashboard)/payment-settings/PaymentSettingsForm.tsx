"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { savePaymentSettings } from "./actions";
import type { PaymentSettings } from "@/lib/payment-settings";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function PaymentSettingsForm({
  initial,
  dict,
  common,
}: {
  initial: PaymentSettings;
  dict: AdminDictionary["pages"]["paymentSettings"];
  common: AdminDictionary["common"];
}) {
  const [state, formAction, pending] = useActionState(
    savePaymentSettings,
    undefined,
  );
  const f = dict.form;

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">{f.bankNameLabel}</label>
        <input
          name="bankName"
          defaultValue={initial.bankName}
          placeholder="Maybank"
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">{f.accountNameLabel}</label>
        <input
          name="accountName"
          defaultValue={initial.accountName}
          placeholder="STUDIO LX SDN BHD"
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">{f.accountNumberLabel}</label>
        <input
          name="accountNumber"
          defaultValue={initial.accountNumber}
          placeholder="1234567890"
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.instructionsLabel}
        </label>
        <textarea
          name="instructions"
          rows={3}
          defaultValue={initial.instructions}
          className="input-theme"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && <p className="text-sm text-gold">{state.success}</p>}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? common.saving : common.save}
      </button>
    </form>
  );
}
