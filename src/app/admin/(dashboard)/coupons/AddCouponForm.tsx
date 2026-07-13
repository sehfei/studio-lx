"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createCoupon } from "./actions";

export function AddCouponForm() {
  const [state, formAction, pending] = useActionState(
    createCoupon,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">优惠码</label>
        <input
          name="code"
          required
          placeholder="SUMMER10"
          className="border border-border-subtle bg-background px-3 py-2 text-sm uppercase outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">类型</label>
        <select
          name="type"
          required
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="percentage">百分比 %</option>
          <option value="fixed">固定金额 RM</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">数值</label>
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
          最低消费（选填）
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
          使用次数上限（选填）
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
          过期时间（选填）
        </label>
        <input
          name="expiresAt"
          type="date"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "添加中" : "+ 添加优惠码"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
