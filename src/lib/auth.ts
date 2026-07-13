import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminPermissionKey } from "@/lib/admin-nav";

// 管理员判定：Supabase Auth 账号 + app_metadata.role === "admin"。
// app_metadata 只能由 service_role 写入（用户自己改不了，跟 user_metadata 不同），
// 这是这里能安全拿它做权限判断的原因。
//
// 前台顾客开放自助注册后，任何人都能在 Supabase Auth 里建出账号，
// 所以「存在账号」不能再等于「是管理员」——必须显式打了 role 标记才算。
// 新增管理员时，要用 service_role 调用
// supabaseAdmin.auth.admin.updateUserById(id, { app_metadata: { role: "admin" } })
// 或 createUser 时直接带上这个 app_metadata，否则登录得进但会被这里拦下。

export function isAdminUser(user: User | null): user is User {
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

// 员工(staff)分权限：app_metadata.role === "staff" + permissions 数组里
// 列出勾选过的后台页面 key（对应 admin-nav.ts 的 key）。
// 跟 role 一样只能由 service_role 写，用户自己改不了。
function getStaffPermissions(user: User | null): string[] {
  const permissions = user?.app_metadata?.permissions;
  return Array.isArray(permissions)
    ? permissions.filter((p): p is string => typeof p === "string")
    : [];
}

function isStaffUser(user: User | null): user is User {
  return !!user && user.app_metadata?.role === "staff";
}

// 判断"这是不是一个有效的后台账号"（能不能进后台 layout），
// 不代表能看到里面每一页——具体到某一页看 hasAdminPermission。
export function isBackendUser(user: User | null): boolean {
  if (isAdminUser(user)) return true;
  if (isStaffUser(user)) return getStaffPermissions(user).length > 0;
  return false;
}

// 页面/Server Action 权限校验的唯一关卡：admin 永远放行，
// staff 看 permissions 里有没有这个 key。
export function hasAdminPermission(
  user: User | null,
  key: AdminPermissionKey,
): boolean {
  if (isAdminUser(user)) return true;
  if (isStaffUser(user)) return getStaffPermissions(user).includes(key);
  return false;
}

// 给 layout 用：换掉原本的 requireAdmin()，任何有效后台账号（admin 或
// 有权限的 staff）都能进后台外壳，具体到每一页再由 requirePermission 把关。
export async function requireBackendUser(): Promise<User> {
  const user = await getUser();
  if (!isBackendUser(user)) {
    redirect("/admin/login");
  }
  return user!;
}

// 页面/Server Action 用：不是有效后台账号就跳登录页；
// 是后台账号但缺这一项权限，跳回后台首页并带上 denied 提示
// （不跳登录页——员工确实登录着，只是少这一项权限，跳登录页会让人困惑）。
export async function requirePermission(
  key: AdminPermissionKey,
): Promise<User> {
  const user = await getUser();
  if (!isBackendUser(user)) {
    redirect("/admin/login");
  }
  if (!hasAdminPermission(user, key)) {
    redirect(`/admin?denied=${key}`);
  }
  return user!;
}

// API 路由用：不 redirect，返回 null 由调用方回 401
export async function requirePermissionApi(
  key: AdminPermissionKey,
): Promise<User | null> {
  const user = await getUser();
  return hasAdminPermission(user, key) ? user : null;
}
