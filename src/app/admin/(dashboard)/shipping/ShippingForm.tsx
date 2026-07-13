"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { saveShippingSettings } from "./actions";
import type { ShippingSettings } from "@/lib/shipping";

export function ShippingForm({ initial }: { initial: ShippingSettings }) {
  const [state, formAction, pending] = useActionState(
    saveShippingSettings,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          西马运费（RM）
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
          东马运费（RM）— 沙巴 / 砂拉越 / 纳闽
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
          免运费门槛（RM，留空表示不设免运费）
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
        {pending ? "保存中" : "保存"}
      </button>
    </form>
  );
}
