import "server-only";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

// listUsers() 默认每页只返回 50 个，用户数一旦超过 50 就会被静默截断——
// 后台客户数统计、客户列表、"不能降级最后一个管理员"的安全校验都依赖全量用户数据。
// 这里循环翻页直到拿完，保证任何规模下数据都是完整的。
export async function listAllUsers(): Promise<User[]> {
  const perPage = 1000;
  const all: User[] = [];
  let page = 1;
  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;
    all.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }
  return all;
}
