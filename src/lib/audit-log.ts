import "server-only";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 后台操作日志：记录谁在什么时候做了什么。
// 关键设计：写日志失败绝不能连累真正的业务操作——这时候业务改动已经
// 成功了，日志只是事后记录，插入报错只打印到服务器控制台，不抛出不返回。
export async function logAdminAction(
  actor: User,
  params: {
    action: string;
    targetType: string;
    targetId?: string;
    summary: string;
    // summary 是给旧记录/数据库里直接查看用的固定文案（历史记录不能回溯翻译）；
    // summaryParams 有值时，后台审计日志页面会按当前语言用 action 对应的模板重新拼一遍。
    summaryParams?: Record<string, string>;
  },
): Promise<void> {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_id: actor.id,
    actor_email: actor.email ?? "unknown",
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    summary: params.summary,
    summary_params: params.summaryParams ?? null,
  });
  if (error) {
    console.error("audit log insert failed:", error);
  }
}
