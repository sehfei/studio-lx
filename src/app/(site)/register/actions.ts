"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/customer-auth";

export type RegisterFormState =
  | { error?: string; needsEmailConfirm?: boolean }
  | undefined;

export async function signUpCustomer(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirect") ?? ""));

  if (!name || !email || !password) {
    return { error: "请填写完整信息" };
  }
  if (password.length < 6) {
    return { error: "密码至少需要 6 位" };
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
        ? "该邮箱已被注册"
        : error.message;
    return { error: message };
  }

  if (!data.session) {
    // Supabase 项目开启了邮箱验证：账号已建好，但要等验证邮件确认才能登录
    return { needsEmailConfirm: true };
  }

  redirect(redirectTo);
}
