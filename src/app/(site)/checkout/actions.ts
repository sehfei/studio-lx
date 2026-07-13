"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCustomer } from "@/lib/customer-auth";
import { dbErrorMessage } from "@/lib/db-error";
import { calculateShippingFee, getShippingSettings } from "@/lib/shipping";

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
};

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
  const total = Number((subtotal + shippingFee).toFixed(2));

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

  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");

  return { orderId: order.id, orderNumber: order.order_number };
}
