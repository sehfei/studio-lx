import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/categories";
import { AddCategoryForm } from "./AddCategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requirePermission("categories");
  const { t } = await getAdminI18n();
  const dict = t.pages.categories;
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
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">{dict.addNew}</p>
        <AddCategoryForm dict={dict} common={t.common} />
      </div>

      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "label", label: dict.columns.label },
          { key: "slug", label: dict.columns.slug, cellClassName: "text-foreground/60" },
          { key: "sort", label: dict.columns.sort, cellClassName: "text-foreground/60" },
          { key: "products", label: dict.columns.products },
          { key: "actions", label: dict.columns.actions },
        ]}
        rows={categories.map((c) => ({
          key: c.id,
          cells: {
            label: c.label,
            slug: c.slug,
            sort: c.sort_order,
            products: countBySlug.get(c.slug) ?? 0,
            actions: (
              <DeleteCategoryButton
                id={c.id}
                slug={c.slug}
                label={c.label}
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
