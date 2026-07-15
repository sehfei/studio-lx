"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type LoginFormState = { error?: string } | undefined;

export async function signInCustomer(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirect") ?? ""));

  if (!email || !password) {
    return { error: "请输入邮箱和密码" };
  }

  // 同一邮箱 15 分钟内最多试 5 次，防止暴力破解密码
  const { allowed } = await checkRateLimit(
    `login:customer:${email.toLowerCase()}`,
    5,
    900,
  );
  if (!allowed) {
    return { error: "尝试次数过多，请 15 分钟后再试" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "邮箱或密码错误" };
  }

  redirect(redirectTo);
}

export async function signOutCustomer() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
