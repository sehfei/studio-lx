"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit-log";

export async function markMessageRead(
  id: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("messages");

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "message.mark_read",
    targetType: "contact_message",
    targetId: id,
    summary: `留言标记已读（id: ${id}）`,
    summaryParams: { id },
  });

  revalidatePath("/admin/messages");
}
