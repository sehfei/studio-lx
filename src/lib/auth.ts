import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 管理员判定：Supabase Auth 账号 + app_metadata.role === "admin"。
// app_metadata 只能由 service_role 写入（用户自己改不了，跟 user_metadata 不同），
// 这是这里能安全拿它做权限判断的原因。
//
// 前台顾客开放自助注册后，任何人都能在 Supabase Auth 里建出账号，
// 所以「存在账号」不能再等于「是管理员」——必须显式打了 role 标记才算。
// 新增管理员时，要用 service_role 调用
// supabaseAdmin.auth.admin.updateUserById(id, { app_metadata: { role: "admin" } })
// 或 createUser 时直接带上这个 app_metadata，否则登录得进但会被这里拦下。

function isAdminUser(user: User | null): user is User {
  return !!user && user.app_metadata?.role === "admin";
}

export async function getUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  // getUser() 会向 Supabase Auth 服务端验证 token，比 getSession() 可信
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

// 页面 / Server Action 用：未登录或不是管理员就跳登录页
export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!isAdminUser(user)) {
    redirect("/admin/login");
  }
  return user;
}

// API 路由用：不 redirect，返回 null 由调用方回 401
export async function requireAdminApi(): Promise<User | null> {
  const user = await getUser();
  return isAdminUser(user) ? user : null;
}
