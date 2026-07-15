import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requirePermission("auditLog");

  const { data: logs } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Audit Log</h1>
      <p className="mb-8 text-sm text-foreground/50">
        最近 200 条后台操作记录，只读，不能修改或删除。
      </p>

      <AdminTable
        emptyText="还没有操作记录。"
        columns={[
          { key: "time", label: "Time", cellClassName: "text-xs text-foreground/40 whitespace-nowrap" },
          { key: "actor", label: "Actor", cellClassName: "text-foreground/70" },
          { key: "action", label: "Action", cellClassName: "font-mono text-xs text-foreground/60" },
          { key: "summary", label: "Summary" },
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
