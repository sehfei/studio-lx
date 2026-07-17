"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/customer-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getI18n } from "@/lib/i18n/dictionaries";

export type RegisterFormState =
  | { error?: string; needsEmailConfirm?: boolean }
  | undefined;

export async function signUpCustomer(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const { t } = await getI18n();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirect") ?? ""));

  if (!name || !email || !password) {
    return { error: t.common.fillAllFields };
  }
  if (password.length < 6) {
    return { error: t.auth.passwordMinLength };
  }

  // 同一 IP 1 小时内最多注册 10 次，防止批量注册滥用
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`register:${ip}`, 10, 3600);
  if (!allowed) {
    return { error: t.common.tooManyAttempts };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // name 存在 user_metadata，顾客自己能改，不用于任何权限判断
    options: { data: { name } },
  });

  if (error) {
    const message =
      error.message === "User already registered"
        ? t.auth.emailAlreadyRegistered
        : error.message;
    return { error: message };
  }

  if (!data.session) {
    // Supabase 项目开启了邮箱验证：账号已建好，但要等验证邮件确认才能登录
    return { needsEmailConfirm: true };
  }

  redirect(redirectTo);
}
