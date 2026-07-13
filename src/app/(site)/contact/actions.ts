"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { dbErrorMessage } from "@/lib/db-error";

export type ContactFormState = { error?: string; success?: boolean } | undefined;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "请填写完整信息" };
  }

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    return { error: dbErrorMessage(error) };
  }

  return { success: true };
}
