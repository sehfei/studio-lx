import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n, type AdminDictionary } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

// summary_params 有值时按当前语言用 action 对应的模板重新拼一遍；
// 没有值（比如迁移前的历史记录）就退回存进数据库时原样存的中文 summary。
function formatSummary(
  row: { action: string; summary: string; summary_params: Record<string, string> | null },
  dict: AdminDictionary["pages"]["auditLog"],
): string {
  if (!row.summary_params) return row.summary;
  const template = dict.actionTemplates[row.action];
  if (!template) return row.summary;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = row.summary_params?.[key];
    if (value === undefined) return `{${key}}`;
    return dict.tokens[value] ?? value;
  });
}

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
            summary: formatSummary(l, dict),
          },
        }))}
      />
    </div>
  );
}
