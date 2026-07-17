"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getI18n } from "@/lib/i18n/dictionaries";

export type LoginFormState = { error?: string } | undefined;

export async function signInCustomer(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirect") ?? ""));

  if (!email || !password) {
    return { error: t.auth.fillEmailPassword };
  }

  // 同一邮箱 15 分钟内最多试 5 次，防止暴力破解密码
  const { allowed } = await checkRateLimit(
    `login:customer:${email.toLowerCase()}`,
    5,
    900,
  );
  if (!allowed) {
    return { error: t.common.tooManyAttempts };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: t.auth.wrongCredentials };
  }

  redirect(redirectTo);
}

export async function signOutCustomer() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
