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
  },
): Promise<void> {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_id: actor.id,
    actor_email: actor.email ?? "unknown",
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    summary: params.summary,
  });
  if (error) {
    console.error("audit log insert failed:", error);
  }
}
