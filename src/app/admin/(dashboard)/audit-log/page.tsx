import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requirePermission("auditLog");
  const { t } = await getAdminI18n();
  const dict = t.pages.auditLog;

  const { data: logs } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>

      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "time", label: dict.columns.time, cellClassName: "text-xs text-foreground/40 whitespace-nowrap" },
          { key: "actor", label: dict.columns.actor, cellClassName: "text-foreground/70" },
          { key: "action", label: dict.columns.action, cellClassName: "font-mono text-xs text-foreground/60" },
          { key: "summary", label: dict.columns.summary },
        ]}
        rows={(logs ?? []).map((l) => ({
          key: l.id,
          cells: {
            time: new Date(l.created_at).toLocaleString("en-MY"),
            actor: l.actor_email,
            action: l.action,
            summary: l.summary,
          },
        }))}
      />
    </div>
  );
}
