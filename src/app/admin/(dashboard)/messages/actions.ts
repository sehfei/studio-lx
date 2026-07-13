"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function markMessageRead(
  id: string,
): Promise<{ error?: string } | undefined> {
  await requirePermission("messages");

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
}
