"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { setPaymentStatus, updateOrderStatus } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function OrderStatusControls({
  id,
  status,
  paymentStatus,
  dict,
}: {
  id: string;
  status: string;
  paymentStatus: string;
  dict: AdminDictionary["pages"]["orders"];
}) {
  const [statusPending, startStatusTransition] = useTransition();
  const [paymentPending, startPaymentTransition] = useTransition();
  const statusOptions = [
    { value: "pending", label: dict.statusOptions.pending },
    { value: "processing", label: dict.statusOptions.processing },
    { value: "shipped", label: dict.statusOptions.shipped },
    { value: "completed", label: dict.statusOptions.completed },
    { value: "cancelled", label: dict.statusOptions.cancelled },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        disabled={statusPending}
        onChange={(e) => {
          const value = e.target.value;
          startStatusTransition(async () => {
            const result = await updateOrderStatus(id, value);
            if (result?.error) alert(result.error);
          });
        }}
        className="border border-border-subtle bg-background px-3 py-1.5 text-sm outline-none focus:border-gold"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={paymentPending}
        onClick={() => {
          startPaymentTransition(async () => {
            const result = await setPaymentStatus(
              id,
              paymentStatus !== "paid",
            );
            if (result?.error) alert(result.error);
          });
        }}
        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm ${
          paymentStatus === "paid"
            ? "border-gold text-gold"
            : "border-border-subtle text-foreground/60 hover:border-gold hover:text-gold"
        }`}
      >
        {paymentPending && <Spinner size="sm" />}
        {paymentStatus === "paid" ? dict.paymentPaid : dict.markAsPaid}
      </button>
    </div>
  );
}
