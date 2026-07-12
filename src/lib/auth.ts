import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 管理员判定：只要是 Supabase Auth 里存在的账号就算管理员。
// 安全前提：Supabase 后台已关闭公开注册（signup_disabled），
// 账号只能由店主在 Dashboard 手动创建。
// ⚠️ 将来要做前台客户注册时，必须先给这里加角色系统
// （区分 admin / customer），否则所有注册客户都能进后台。

export async function getUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  // getUser() 会向 Supabase Auth 服务端验证 token，比 getSession() 可信
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

// 页面 / Server Action 用：未登录就跳登录页
export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

// API 路由用：不 redirect，返回 null 由调用方回 401
export async function requireAdminApi(): Promise<User | null> {
  return getUser();
}
