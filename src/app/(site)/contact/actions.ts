"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { dbErrorMessage } from "@/lib/db-error";
import { getI18n } from "@/lib/i18n/dictionaries";

export type ContactFormState = { error?: string; success?: boolean } | undefined;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // 蜜罐字段：真人看不到也不会填，有值说明是脚本无脑填了所有输入框。
  // 假装提交成功但不真的写入，不让对方知道自己被拦了。
  if (String(formData.get("company") ?? "").trim()) {
    return { success: true };
  }

  const { t } = await getI18n();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: t.common.fillAllFields };
  }

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    return { error: dbErrorMessage(error) };
  }

  return { success: true };
}
