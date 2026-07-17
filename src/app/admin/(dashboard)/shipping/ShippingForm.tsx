"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { saveShippingSettings } from "./actions";
import type { ShippingSettings } from "@/lib/shipping";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function ShippingForm({
  initial,
  dict,
  common,
}: {
  initial: ShippingSettings;
  dict: AdminDictionary["pages"]["shipping"];
  common: AdminDictionary["common"];
}) {
  const [state, formAction, pending] = useActionState(
    saveShippingSettings,
    undefined,
  );
  const f = dict.form;

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.westFeeLabel}
        </label>
        <input
          name="westFee"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial.westFee}
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.eastFeeLabel}
        </label>
        <input
          name="eastFee"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial.eastFee}
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.freeShippingThresholdLabel}
        </label>
        <input
          name="freeShippingThreshold"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial.freeShippingThreshold ?? ""}
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
