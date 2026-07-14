import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getGenders } from "@/lib/genders";
import { AddGenderForm } from "./AddGenderForm";
import { DeleteGenderButton } from "./DeleteGenderButton";

export const dynamic = "force-dynamic";

export default async function AdminGendersPage() {
  await requirePermission("genders");
  const genders = await getGenders();

  const { data: products } = await supabaseAdmin
    .from("products")
    .select("gender");
  const countBySlug = new Map<string, number>();
  for (const p of products ?? []) {
    countBySlug.set(p.gender, (countBySlug.get(p.gender) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Gender Management</h1>
      <p className="mb-8 text-sm text-foreground/50">
        商品性别分区，比如女装/男装。有商品在用的分区不能删除。
      </p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">添加新分区</p>
        <AddGenderForm />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
              <th className="py-3">Label</th>
              <th className="py-3">Slug</th>
              <th className="py-3">Sort</th>
              <th className="py-3">Products</th>
              <th className="py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {genders.map((g) => (
              <tr key={g.id} className="border-b border-border-subtle">
                <td className="py-3">{g.label}</td>
                <td className="py-3 text-foreground/60">{g.slug}</td>
                <td className="py-3 text-foreground/60">{g.sort_order}</td>
                <td className="py-3">{countBySlug.get(g.slug) ?? 0}</td>
                <td className="py-3">
                  <DeleteGenderButton
                    id={g.id}
                    slug={g.slug}
                    label={g.label}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
