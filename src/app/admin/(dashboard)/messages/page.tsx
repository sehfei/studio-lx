import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MarkReadButton } from "./MarkReadButton";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requirePermission("messages");
  const { data: messages } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const unreadCount = (messages ?? []).filter((m) => !m.is_read).length;

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Messages</h1>
      <p className="mb-8 text-sm text-foreground/50">
        联系表单收到的留言{unreadCount > 0 ? `，${unreadCount} 条未读` : ""}。
      </p>

      {!messages || messages.length === 0 ? (
        <p className="text-sm text-foreground/50">还没有收到留言。</p>
      ) : (
        <ul className="divide-y divide-border-subtle border-t border-b border-border-subtle">
          {messages.map((m) => (
            <li key={m.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="ml-2 text-xs text-foreground/50">
                    {m.email}
                  </span>
                  {!m.is_read && (
                    <span className="ml-2 bg-gold px-1.5 py-0.5 text-xs text-background">
                      未读
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground/40">
                  {new Date(m.created_at).toLocaleString("en-MY")}
                  {!m.is_read && <MarkReadButton id={m.id} />}
                </div>
              </div>
              <p className="text-sm text-foreground/70">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
