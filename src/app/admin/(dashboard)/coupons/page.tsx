import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AddCouponForm } from "./AddCouponForm";
import { CouponControls } from "./CouponControls";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requirePermission("coupons");
  const { data: coupons } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Coupons</h1>
      <p className="mb-8 text-sm text-foreground/50">
        折扣码，顾客结账时输入使用。
      </p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">添加新优惠码</p>
        <AddCouponForm />
      </div>

      <AdminTable
        emptyText="还没有优惠码。"
        columns={[
          { key: "code", label: "Code", cellClassName: "font-medium" },
          { key: "discount", label: "Discount" },
          { key: "minSpend", label: "Min Spend", cellClassName: "text-foreground/60" },
          { key: "used", label: "Used", cellClassName: "text-foreground/60" },
          { key: "expires", label: "Expires", cellClassName: "text-foreground/60" },
          { key: "actions", label: "操作" },
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
              />
            ),
          },
        }))}
      />
    </div>
  );
}
