"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
  await requirePermission("orders");

  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { error: "无效的订单状态" };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function setPaymentStatus(
  id: string,
  paid: boolean,
): Promise<{ error: string } | undefined> {
  await requirePermission("orders");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ payment_status: paid ? "paid" : "unpaid" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
