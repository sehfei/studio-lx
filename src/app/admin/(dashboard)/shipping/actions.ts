"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dbErrorMessage } from "@/lib/db-error";
import { logAdminAction } from "@/lib/audit-log";
import type { ShippingSettings } from "@/lib/shipping";

export type ShippingFormState = { error?: string; success?: string } | undefined;

export async function saveShippingSettings(
  _prevState: ShippingFormState,
  formData: FormData,
): Promise<ShippingFormState> {
  const admin = await requirePermission("shipping");

  const westFee = Number(formData.get("westFee"));
  const eastFee = Number(formData.get("eastFee"));
  const thresholdRaw = String(formData.get("freeShippingThreshold") ?? "").trim();

  if (!Number.isFinite(westFee) || westFee < 0) {
    return { error: "西马运费必须是不小于 0 的数字" };
  }
  if (!Number.isFinite(eastFee) || eastFee < 0) {
    return { error: "东马运费必须是不小于 0 的数字" };
  }

  let freeShippingThreshold: number | null = null;
  if (thresholdRaw) {
    const parsed = Number(thresholdRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { error: "免运费门槛必须是不小于 0 的数字" };
    }
    freeShippingThreshold = parsed;
  }

  const shipping: ShippingSettings = { westFee, eastFee, freeShippingThreshold };

  const { error } = await supabaseAdmin
    .from("shipping_settings")
    .upsert({ id: 1, shipping, updated_at: new Date().toISOString() });

  if (error) return { error: dbErrorMessage(error) };

  await logAdminAction(admin, {
    action: "shipping_settings.save",
    targetType: "shipping_settings",
    summary: `更新运费设置（西马 RM${westFee} / 东马 RM${eastFee}）`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/shipping");
  return { success: "已保存，结账时立即生效" };
}
