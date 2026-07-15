import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getGenders } from "@/lib/genders";
import { AddGenderForm } from "./AddGenderForm";
import { DeleteGenderButton } from "./DeleteGenderButton";
import { AdminTable } from "@/components/admin/AdminTable";

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

      <AdminTable
        emptyText="还没有分区。"
        columns={[
          { key: "label", label: "Label" },
          { key: "slug", label: "Slug", cellClassName: "text-foreground/60" },
          { key: "sort", label: "Sort", cellClassName: "text-foreground/60" },
          { key: "products", label: "Products" },
          { key: "actions", label: "操作" },
        ]}
        rows={genders.map((g) => ({
          key: g.id,
          cells: {
            label: g.label,
            slug: g.slug,
            sort: g.sort_order,
            products: countBySlug.get(g.slug) ?? 0,
            actions: (
              <DeleteGenderButton id={g.id} slug={g.slug} label={g.label} />
            ),
          },
        }))}
      />
    </div>
  );
}
