"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dbErrorMessage } from "@/lib/db-error";
import type { PaymentSettings } from "@/lib/payment-settings";

export type PaymentSettingsFormState =
  | { error?: string; success?: string }
  | undefined;

export async function savePaymentSettings(
  _prevState: PaymentSettingsFormState,
  formData: FormData,
): Promise<PaymentSettingsFormState> {
  await requirePermission("paymentSettings");

  const payment: PaymentSettings = {
    bankName: String(formData.get("bankName") ?? "").trim(),
    accountName: String(formData.get("accountName") ?? "").trim(),
    accountNumber: String(formData.get("accountNumber") ?? "").trim(),
    instructions: String(formData.get("instructions") ?? "").trim(),
  };

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, payment, updated_at: new Date().toISOString() });

  if (error) return { error: dbErrorMessage(error) };

  revalidatePath("/", "layout");
  revalidatePath("/admin/payment-settings");
  return { success: "已保存" };
}
