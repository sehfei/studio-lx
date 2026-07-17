"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createCoupon } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function AddCouponForm({
  dict,
  common,
}: {
  dict: AdminDictionary["pages"]["coupons"];
  common: AdminDictionary["common"];
}) {
  const [state, formAction, pending] = useActionState(
    createCoupon,
    undefined,
  );
  const f = dict.form;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.codeLabel}
        </label>
        <input
          name="code"
          required
          placeholder="SUMMER10"
          className="border border-border-subtle bg-background px-3 py-2 text-sm uppercase outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.typeLabel}
        </label>
        <select
          name="type"
          required
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="percentage">{f.percentageOption}</option>
          <option value="fixed">{f.fixedOption}</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.valueLabel}
        </label>
        <input
          name="value"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="10"
          className="w-24 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.minSpendLabel}
        </label>
        <input
          name="minSpend"
          type="number"
          step="0.01"
          min="0"
          className="w-28 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.maxUsesLabel}
        </label>
        <input
          name="maxUses"
          type="number"
          min="1"
          className="w-28 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {f.expiresAtLabel}
        </label>
        <input
          name="expiresAt"
          type="date"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? common.adding : dict.addButton}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
