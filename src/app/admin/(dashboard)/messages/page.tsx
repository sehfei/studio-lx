import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MarkReadButton } from "./MarkReadButton";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requirePermission("messages");
  const { t } = await getAdminI18n();
  const dict = t.pages.messages;
  const { data: messages } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const unreadCount = (messages ?? []).filter((m) => !m.is_read).length;

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">
        {unreadCount > 0
          ? dict.descUnread.replace("{n}", String(unreadCount))
          : dict.descAllRead}
      </p>

      {!messages || messages.length === 0 ? (
        <p className="text-sm text-foreground/50">{dict.empty}</p>
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
                      {dict.unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground/40">
                  {new Date(m.created_at).toLocaleString("en-MY")}
                  {!m.is_read && <MarkReadButton id={m.id} dict={dict} />}
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
