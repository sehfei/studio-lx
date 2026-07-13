import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/categories";
import { AddCategoryForm } from "./AddCategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
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
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-border-subtle">
                <td className="py-3">{c.label}</td>
                <td className="py-3 text-foreground/60">{c.slug}</td>
                <td className="py-3 text-foreground/60">{c.sort_order}</td>
                <td className="py-3">{countBySlug.get(c.slug) ?? 0}</td>
                <td className="py-3">
                  <DeleteCategoryButton
                    id={c.id}
                    slug={c.slug}
                    label={c.label}
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
