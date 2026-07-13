import { supabaseAdmin } from "@/lib/supabase/admin";
import { AddCouponForm } from "./AddCouponForm";
import { CouponControls } from "./CouponControls";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
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

      {!coupons || coupons.length === 0 ? (
        <p className="text-sm text-foreground/50">还没有优惠码。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
                <th className="py-3">Code</th>
                <th className="py-3">Discount</th>
                <th className="py-3">Min Spend</th>
                <th className="py-3">Used</th>
                <th className="py-3">Expires</th>
                <th className="py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border-subtle">
                  <td className="py-3 font-medium">{c.code}</td>
                  <td className="py-3">
                    {c.type === "percentage"
                      ? `${c.value}%`
                      : `RM ${Number(c.value).toFixed(2)}`}
                  </td>
                  <td className="py-3 text-foreground/60">
                    {c.min_spend ? `RM ${Number(c.min_spend).toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3 text-foreground/60">
                    {c.used_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="py-3 text-foreground/60">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString("en-MY")
                      : "—"}
                  </td>
                  <td className="py-3">
                    <CouponControls
                      id={c.id}
                      code={c.code}
                      isActive={c.is_active}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
