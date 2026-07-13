"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { setPaymentStatus, updateOrderStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusControls({
  id,
  status,
  paymentStatus,
}: {
  id: string;
  status: string;
  paymentStatus: string;
}) {
  const [statusPending, startStatusTransition] = useTransition();
  const [paymentPending, startPaymentTransition] = useTransition();

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
        {STATUS_OPTIONS.map((opt) => (
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
        {paymentStatus === "paid" ? "已付款" : "标记已付款"}
      </button>
    </div>
  );
}
