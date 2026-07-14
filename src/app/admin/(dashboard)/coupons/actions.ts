"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dbErrorMessage } from "@/lib/db-error";
import { logAdminAction } from "@/lib/audit-log";

export type CouponFormState = { error?: string } | undefined;

export async function createCoupon(
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  const admin = await requirePermission("coupons");

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "");
  const value = Number(formData.get("value"));
  const minSpendRaw = String(formData.get("minSpend") ?? "").trim();
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!code) return { error: "请填写优惠码" };
  if (type !== "percentage" && type !== "fixed") {
    return { error: "请选择折扣类型" };
  }
  if (!Number.isFinite(value) || value <= 0) {
    return { error: "折扣数值必须大于 0" };
  }
  if (type === "percentage" && value > 100) {
    return { error: "百分比折扣不能超过 100" };
  }

  const minSpend = minSpendRaw ? Number(minSpendRaw) : null;
  if (minSpend !== null && (!Number.isFinite(minSpend) || minSpend < 0)) {
    return { error: "最低消费金额无效" };
  }
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses <= 0)) {
    return { error: "使用次数上限无效" };
  }
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;

  const { error } = await supabaseAdmin.from("coupons").insert({
    code,
    type,
    value,
    min_spend: minSpend,
    max_uses: maxUses,
    expires_at: expiresAt,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `优惠码 "${code}" 已存在` };
    }
    return { error: dbErrorMessage(error) };
  }

  await logAdminAction(admin, {
    action: "coupon.create",
    targetType: "coupon",
    targetId: code,
    summary: `新增优惠码「${code}」`,
  });

  revalidatePath("/admin/coupons");
  return undefined;
}

export async function toggleCouponActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("coupons");
  const { error } = await supabaseAdmin
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "coupon.toggle_active",
    targetType: "coupon",
    targetId: id,
    summary: `优惠码${isActive ? "启用" : "停用"}（id: ${id}）`,
  });

  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(
  id: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("coupons");
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "coupon.delete",
    targetType: "coupon",
    targetId: id,
    summary: `删除优惠码（id: ${id}）`,
  });

  revalidatePath("/admin/coupons");
}
