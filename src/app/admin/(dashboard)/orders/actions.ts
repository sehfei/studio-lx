"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit-log";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<{ error: string } | undefined> {
  const admin = await requirePermission("orders");

  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { error: "无效的订单状态" };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "order.status_change",
    targetType: "order",
    targetId: id,
    summary: `订单状态改为「${status}」`,
    summaryParams: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function setPaymentStatus(
  id: string,
  paid: boolean,
): Promise<{ error: string } | undefined> {
  const admin = await requirePermission("orders");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ payment_status: paid ? "paid" : "unpaid" })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "order.payment_change",
    targetType: "order",
    targetId: id,
    summary: `订单${paid ? "标记为已付款" : "标记为未付款"}`,
    summaryParams: { status: paid ? "paidStatus" : "unpaidStatus" },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
