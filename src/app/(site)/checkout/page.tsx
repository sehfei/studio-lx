import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">Checkout</h1>
      <p className="text-sm text-foreground/50">
        结账与支付网关功能开发中，暂未开放。
      </p>
    </div>
  );
}
