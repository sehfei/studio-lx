import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type CouponRow = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_spend: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
};

export type CouponCheckResult =
  | { ok: true; coupon: CouponRow; discount: number }
  | { ok: false; error: string };

// 结账和后台都要校验同一套规则：启用中、没过期、没超使用次数、满足最低消费。
// 折扣金额四舍五入到分，且不会超过订单小计（避免折成负数）。
export async function checkCoupon(
  code: string,
  subtotal: number,
  t: Dictionary,
): Promise<CouponCheckResult> {
  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error || !coupon) {
    return { ok: false, error: t.checkout.couponNotFound };
  }
  if (!coupon.is_active) {
    return { ok: false, error: t.checkout.couponDisabled };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { ok: false, error: t.checkout.couponExpired };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, error: t.checkout.couponMaxUsesReached };
  }
  if (coupon.min_spend !== null && subtotal < Number(coupon.min_spend)) {
    return {
      ok: false,
      error: t.checkout.couponMinSpend.replace(
        "{amount}",
        Number(coupon.min_spend).toFixed(2),
      ),
    };
  }

  const rawDiscount =
    coupon.type === "percentage"
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);
  const discount = Number(Math.min(rawDiscount, subtotal).toFixed(2));

  return { ok: true, coupon: coupon as CouponRow, discount };
}
