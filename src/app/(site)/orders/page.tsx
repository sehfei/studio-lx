import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order History" };

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">Order History</h1>
      <p className="text-sm text-foreground/50">
        暂无订单记录。订单追踪功能开发中。
      </p>
    </div>
  );
}
