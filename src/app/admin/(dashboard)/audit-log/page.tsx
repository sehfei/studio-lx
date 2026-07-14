import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
              <th className="py-3">Time</th>
              <th className="py-3">Actor</th>
              <th className="py-3">Action</th>
              <th className="py-3">Summary</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((l) => (
              <tr key={l.id} className="border-b border-border-subtle">
                <td className="py-3 text-xs text-foreground/40 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString("en-MY")}
                </td>
                <td className="py-3 text-foreground/70">{l.actor_email}</td>
                <td className="py-3 font-mono text-xs text-foreground/60">
                  {l.action}
                </td>
                <td className="py-3">{l.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && (
          <p className="py-8 text-center text-sm text-foreground/50">
            还没有操作记录。
          </p>
        )}
      </div>
    </div>
  );
}
