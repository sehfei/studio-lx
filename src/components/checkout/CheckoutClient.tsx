"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartContext";
import { createOrder } from "@/app/(site)/checkout/actions";
import {
  calculateShippingFee,
  MALAYSIA_STATES,
  type ShippingSettings,
} from "@/lib/shipping";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CheckoutClient({
  t,
  customerEmail,
  shippingSettings,
}: {
  t: Dictionary;
  customerEmail: string;
  shippingSettings: ShippingSettings;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState("");

  // 州属还没选之前不算运费，避免总计里悄悄含了一个还没显示出来的费用
  const shippingFee = useMemo(
    () => (state ? calculateShippingFee(state, subtotal, shippingSettings) : 0),
    [state, subtotal, shippingSettings],
  );
  const total = subtotal + shippingFee;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const get = (name: string) => String(formData.get(name) ?? "").trim();

    startTransition(async () => {
      const result = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        address: get("address"),
        city: get("city"),
        state: get("state"),
        postcode: get("postcode"),
        notes: get("notes"),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      clear();
      router.push(`/checkout/success?order=${result.orderId}`);
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
        <h1 className="section-title mb-8">{t.checkout.title}</h1>
        <p className="mb-8 text-sm text-foreground/50">{t.checkout.emptyCart}</p>
        <Link href="/" className="btn-primary">
          {t.common.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.checkout.title}</h1>
      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="eyebrow">{t.checkout.contactInfo}</h2>
          {error && (
            <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <input
            name="name"
            required
            placeholder={t.checkout.fullName}
            className="input-theme"
          />
          <input
            name="phone"
            required
            placeholder={t.checkout.phone}
            className="input-theme"
          />
          <input
            name="email"
            type="email"
            defaultValue={customerEmail}
            placeholder={t.checkout.email}
            className="input-theme"
          />
          <input
            name="address"
            required
            placeholder={t.checkout.address}
            className="input-theme"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              required
              placeholder={t.checkout.city}
              className="input-theme"
            />
            <select
              name="state"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-theme"
            >
              <option value="" disabled>
                {t.checkout.state}
              </option>
              {MALAYSIA_STATES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <input
            name="postcode"
            required
            placeholder={t.checkout.postcode}
            className="input-theme"
          />
          <textarea
            name="notes"
            placeholder={t.checkout.notesPlaceholder}
            rows={3}
            className="input-theme"
          />
          <button
            type="submit"
            disabled={pending}
            className="btn-primary w-full"
          >
            {pending ? t.checkout.placingOrder : t.checkout.placeOrder}
          </button>
        </form>

        <div>
          <h2 className="eyebrow mb-4">{t.checkout.orderSummary}</h2>
          <ul className="divide-y divide-border-subtle border-t border-b border-border-subtle">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.color}-${item.size}`}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p>{item.name}</p>
                  <p className="text-xs text-foreground/50">
                    {[item.color, item.size].filter(Boolean).join(" / ")} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p>RM {(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">{t.cart.subtotal}</span>
              <span>RM {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">{t.checkout.shippingFee}</span>
              <span>
                {state ? `RM ${shippingFee.toFixed(2)}` : t.checkout.selectStateFirst}
              </span>
            </div>
            <div className="flex justify-between text-base font-medium">
              <span>{t.checkout.total}</span>
              <span>RM {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
