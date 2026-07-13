import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getUser } from "@/lib/auth";

// 顾客鉴权：任何登录用户都算顾客（不检查 role，跟 requireAdmin 的角色判定无关）。
// 结账等需要登录的前台页面用这个，未登录会带上 redirect 参数跳去登录页，
// 登录成功后 login action 会读这个参数把用户送回原本要去的页面。
export async function requireCustomer(redirectTo: string): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

export async function getCustomer(): Promise<User | null> {
  return getUser();
}

// redirect 参数来自 URL 查询字符串（用户可控），登录/注册成功后要跳去这里。
// 只允许站内相对路径，防止被构造成跳去外部网站（open redirect）。
export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/account";
  }
  return path;
}
