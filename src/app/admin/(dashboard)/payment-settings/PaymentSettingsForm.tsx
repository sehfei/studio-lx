"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { savePaymentSettings } from "./actions";
import type { PaymentSettings } from "@/lib/payment-settings";

export function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const [state, formAction, pending] = useActionState(
    savePaymentSettings,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">银行名称</label>
        <input
          name="bankName"
          defaultValue={initial.bankName}
          placeholder="Maybank"
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">户口持有人</label>
        <input
          name="accountName"
          defaultValue={initial.accountName}
          placeholder="STUDIO LX SDN BHD"
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">户口号码</label>
        <input
          name="accountNumber"
          defaultValue={initial.accountNumber}
          placeholder="1234567890"
          className="input-theme"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          额外说明（选填，例如：转账后请把收据发到 WhatsApp）
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
        {pending ? "保存中" : "保存"}
      </button>
    </form>
  );
}
