import "server-only";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Vercel 在 x-forwarded-for 里带真实客户端 IP（第一个是客户端，后面是各级代理）。
// 没有这个头（本地开发）就退回一个固定值，本地跑不受限流影响。
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "local";
}

// 用 Postgres 表做限流，不额外接 Upstash/Redis 这类付费服务。
// key 自己决定粒度（比如 login:admin:邮箱、api:用户id），
// 每次调用先数窗口内命中次数，够了就拒绝，没够就记一条再放行。
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= limit) {
    return { allowed: false, retryAfterSeconds: windowSeconds };
  }

  await supabaseAdmin.from("rate_limit_hits").insert({ key });

  // 1% 概率顺手清一次一天前的旧记录，不用单独跑定时任务
  if (Math.random() < 0.01) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin.from("rate_limit_hits").delete().lt("created_at", dayAgo);
  }

  return { allowed: true };
}
