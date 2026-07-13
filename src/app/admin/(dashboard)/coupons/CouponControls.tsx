"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteCoupon, toggleCouponActive } from "./actions";

export function CouponControls({
  id,
  code,
  isActive,
}: {
  id: string;
  code: string;
  isActive: boolean;
}) {
  const [togglePending, startToggle] = useTransition();
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={togglePending}
        onClick={() => {
          startToggle(async () => {
            const result = await toggleCouponActive(id, !isActive);
            if (result?.error) alert(result.error);
          });
        }}
        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs ${
          isActive
            ? "border-gold/40 text-gold"
            : "border-border-subtle text-foreground/50"
        }`}
      >
        {togglePending && <Spinner size="sm" />}
        {isActive ? "已启用" : "已停用"}
      </button>
      <button
        type="button"
        disabled={deletePending}
        onClick={() => {
          if (!confirm(`确定删除优惠码「${code}」？`)) return;
          startDelete(async () => {
            const result = await deleteCoupon(id);
            if (result?.error) alert(result.error);
          });
        }}
        className="text-xs text-destructive hover:underline disabled:opacity-50"
      >
        {deletePending ? "删除中" : "删除"}
      </button>
    </div>
  );
}
