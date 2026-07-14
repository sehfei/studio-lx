"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCustomer } from "@/lib/customer-auth";
import { dbErrorMessage } from "@/lib/db-error";
import { calculateShippingFee, getShippingSettings } from "@/lib/shipping";
import { checkCoupon } from "@/lib/coupon";
import { getPaymentSettings } from "@/lib/payment-settings";
import { sendOrderConfirmationEmail } from "@/lib/email";

// 结账现在要求登录：页面层 requireCustomer() 已经拦一次，
// 这里再查一次当前登录用户，双重保险——防止有人绕过页面直接调这个 action。
// 价格/库存也绝不信任客户端传来的值——用 productId 重新查
// Supabase 里的真实单价和库存，全部以服务端查到的数据为准。

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
};

export type CheckoutInput = {
  items: CheckoutItemInput[];
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  notes?: string;
  couponCode?: string;
};

export type CouponPreviewResult =
  | { ok: true; discount: number; description: string }
  | { ok: false; error: string };

// 结账页输入优惠码时的实时预览校验，用同一套 checkCoupon() 规则，
// 真正下单时 createOrder 还会再校验一次（不信任这次预览的结果）。
export async function previewCoupon(
  code: string,
  subtotal: number,
): Promise<CouponPreviewResult> {
  const result = await checkCoupon(code, subtotal);
  if (!result.ok) return { ok: false, error: result.error };
  const description =
    result.coupon.type === "percentage"
      ? `${result.coupon.value}% 折扣`
      : `减 RM ${result.coupon.value.toFixed(2)}`;
  return { ok: true, discount: result.discount, description };
}

export type CheckoutResult = {
  error?: string;
  orderId?: string;
  orderNumber?: string;
};

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LX${y}${m}${d}-${rand}`;
}

export async function createOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const customer = await getCustomer();
  if (!customer) {
    return { error: "请先登录才能结账" };
  }

  if (!input.items || input.items.length === 0) {
    return { error: "购物车是空的" };
  }
  if (
    !input.name.trim() ||
    !input.phone.trim() ||
    !input.address.trim() ||
    !input.city.trim() ||
    !input.state.trim() ||
    !input.postcode.trim()
  ) {
    return { error: "请填写完整的收货信息" };
  }

  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: fetchError } = await supabaseAdmin
    .from("products")
    .select("id, name, sku, price, discount_price, stock, images")
    .in("id", productIds);

  if (fetchError) {
    return { error: "商品信息查询失败：" + dbErrorMessage(fetchError) };
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const orderItems: {
    product_id: string;
    product_name: string;
    product_sku: string;
    product_image: string | null;
    color: string | null;
    size: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: `商品不存在或已下架` };
    }
    if (item.quantity < 1) {
      return { error: `${product.name} 数量无效` };
    }
    if (product.stock < item.quantity) {
      return { error: `${product.name} 库存不足，仅剩 ${product.stock} 件` };
    }
    const unitPrice =
      typeof product.discount_price === "number" &&
      product.discount_price < product.price
        ? product.discount_price
        : product.price;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_image: product.images?.[0] ?? null,
      color: item.color || null,
      size: item.size || null,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: Number((unitPrice * item.quantity).toFixed(2)),
    });
  }

  const subtotal = Number(
    orderItems.reduce((sum, i) => sum + i.line_total, 0).toFixed(2),
  );
  // 运费也用服务端算的，不信任客户端传来的金额——跟价格/库存同样的道理
  const shippingSettings = await getShippingSettings();
  const shippingFee = calculateShippingFee(
    input.state.trim(),
    subtotal,
    shippingSettings,
  );

  // 优惠码同理：服务端重新校验一次，不信任结账页预览时算出的折扣金额
  let discountAmount = 0;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const couponResult = await checkCoupon(input.couponCode, subtotal);
    if (!couponResult.ok) {
      return { error: couponResult.error };
    }
    discountAmount = couponResult.discount;
    couponCode = couponResult.coupon.code;
  }

  const total = Number(
    (subtotal + shippingFee - discountAmount).toFixed(2),
  );

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      customer_name: input.name.trim(),
      customer_phone: input.phone.trim(),
      customer_email: input.email?.trim() || null,
      shipping_address: input.address.trim(),
      shipping_city: input.city.trim(),
      shipping_state: input.state.trim(),
      shipping_postcode: input.postcode.trim(),
      notes: input.notes?.trim() || "",
      subtotal,
      shipping_fee: shippingFee,
      coupon_code: couponCode,
      discount_amount: discountAmount,
      total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return {
      error: orderError
        ? "订单创建失败：" + dbErrorMessage(orderError)
        : "订单创建失败：未知错误",
    };
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    // 订单行插入失败就回滚订单本身，避免留下没有商品明细的空订单
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return { error: "订单明细创建失败：" + dbErrorMessage(itemsError) };
  }

  for (const item of orderItems) {
    const product = productMap.get(item.product_id)!;
    await supabaseAdmin
      .from("products")
      .update({ stock: product.stock - item.quantity })
      .eq("id", item.product_id);
  }

  if (couponCode) {
    // 订单已经成功创建，优惠码核销失败也不影响下单，静默即可，
    // 用量统计小范围不一致比让顾客白等一个已经成立的订单更划算
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("used_count")
      .eq("code", couponCode)
      .maybeSingle();
    if (coupon) {
      await supabaseAdmin
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("code", couponCode);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");

  // 结账要求登录，customer.email 是账号本身的邮箱，一定存在——
  // 比依赖结账表单选填的 email 字段更可靠。发信失败不影响订单已经成立这件事，
  // 跟上面优惠码核销失败"静默即可"是同一个原则。
  if (customer.email) {
    try {
      const payment = await getPaymentSettings();
      await sendOrderConfirmationEmail({
        to: customer.email,
        orderNumber: order.order_number,
        total,
        items: orderItems,
        payment,
      });
    } catch (err) {
      console.error("order confirmation email failed:", err);
    }
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
