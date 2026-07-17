"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteCoupon, toggleCouponActive } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function CouponControls({
  id,
  code,
  isActive,
  dict,
  common,
}: {
  id: string;
  code: string;
  isActive: boolean;
  dict: AdminDictionary["pages"]["coupons"];
  common: AdminDictionary["common"];
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
        {isActive ? dict.enabled : dict.disabled}
      </button>
      <button
        type="button"
        disabled={deletePending}
        onClick={() => {
          if (!confirm(dict.confirmDelete.replace("{code}", code))) return;
          startDelete(async () => {
            const result = await deleteCoupon(id);
            if (result?.error) alert(result.error);
          });
        }}
        className="text-xs text-destructive hover:underline disabled:opacity-50"
      >
        {deletePending ? common.deleting : common.delete}
      </button>
    </div>
  );
}
