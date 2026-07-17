import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AddCouponForm } from "./AddCouponForm";
import { CouponControls } from "./CouponControls";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requirePermission("coupons");
  const { t } = await getAdminI18n();
  const dict = t.pages.coupons;
  const { data: coupons } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">{dict.addNew}</p>
        <AddCouponForm dict={dict} common={t.common} />
      </div>

      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "code", label: dict.columns.code, cellClassName: "font-medium" },
          { key: "discount", label: dict.columns.discount },
          { key: "minSpend", label: dict.columns.minSpend, cellClassName: "text-foreground/60" },
          { key: "used", label: dict.columns.used, cellClassName: "text-foreground/60" },
          { key: "expires", label: dict.columns.expires, cellClassName: "text-foreground/60" },
          { key: "actions", label: dict.columns.actions },
        ]}
        rows={(coupons ?? []).map((c) => ({
          key: c.id,
          cells: {
            code: c.code,
            discount:
              c.type === "percentage"
                ? `${c.value}%`
                : `RM ${Number(c.value).toFixed(2)}`,
            minSpend: c.min_spend
              ? `RM ${Number(c.min_spend).toFixed(2)}`
              : "—",
            used: `${c.used_count}${c.max_uses ? ` / ${c.max_uses}` : ""}`,
            expires: c.expires_at
              ? new Date(c.expires_at).toLocaleDateString("en-MY")
              : "—",
            actions: (
              <CouponControls
                id={c.id}
                code={c.code}
                isActive={c.is_active}
                dict={dict}
                common={t.common}
              />
            ),
          },
        }))}
      />
    </div>
  );
}
