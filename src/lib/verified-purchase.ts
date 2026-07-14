import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 判断这个顾客是不是真的付款买过这个商品——评价功能的准入门槛。
// 用 payment_status = 'paid' 而不是 status，付款确认就是"真实购买"的信号，
// 不用等物流状态变成 completed（那样会不必要地拖慢顾客能评价的时间）。
export async function hasVerifiedPurchase(
  customerId: string,
  productId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("order_items")
    .select("id, orders!inner(customer_id, payment_status)")
    .eq("product_id", productId)
    .eq("orders.customer_id", customerId)
    .eq("orders.payment_status", "paid")
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}
