import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/categories";
import { AddCategoryForm } from "./AddCategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requirePermission("categories");
  const categories = await getCategories();

  const { data: products } = await supabaseAdmin
    .from("products")
    .select("category");
  const countBySlug = new Map<string, number>();
  for (const p of products ?? []) {
    countBySlug.set(p.category, (countBySlug.get(p.category) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Category Management</h1>
      <p className="mb-8 text-sm text-foreground/50">
        商品分类，男装女装通用。有商品在用的分类不能删除。
      </p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">添加新分类</p>
        <AddCategoryForm />
      </div>

      <AdminTable
        emptyText="还没有分类。"
        columns={[
          { key: "label", label: "Label" },
          { key: "slug", label: "Slug", cellClassName: "text-foreground/60" },
          { key: "sort", label: "Sort", cellClassName: "text-foreground/60" },
          { key: "products", label: "Products" },
          { key: "actions", label: "操作" },
        ]}
        rows={categories.map((c) => ({
          key: c.id,
          cells: {
            label: c.label,
            slug: c.slug,
            sort: c.sort_order,
            products: countBySlug.get(c.slug) ?? 0,
            actions: (
              <DeleteCategoryButton id={c.id} slug={c.slug} label={c.label} />
            ),
          },
        }))}
      />
    </div>
  );
}
