import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/categories";
import { getSubcategories } from "@/lib/subcategories";
import { AddSubcategoryForm } from "./AddSubcategoryForm";
import { DeleteSubcategoryButton } from "./DeleteSubcategoryButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminSubcategoriesPage() {
  await requirePermission("subcategories");
  const { t } = await getAdminI18n();
  const dict = t.pages.subcategories;

  const [categories, subcategories, { data: products }] = await Promise.all([
    getCategories(),
    getSubcategories(),
    supabaseAdmin.from("products").select("subcategory"),
  ]);

  const countBySlug = new Map<string, number>();
  for (const p of products ?? []) {
    if (!p.subcategory) continue;
    countBySlug.set(p.subcategory, (countBySlug.get(p.subcategory) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>

      {categories.length === 0 ? (
        <p className="text-sm text-foreground/50">{dict.noCategoriesYet}</p>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => {
            const items = subcategories.filter(
              (s) => s.category === category.slug,
            );
            return (
              <div key={category.slug}>
                <h2 className="eyebrow mb-3">{category.label}</h2>

                <div className="mb-4 border border-border-subtle p-4">
                  <AddSubcategoryForm
                    category={category.slug}
                    dict={dict}
                    common={t.common}
                  />
                </div>

                <AdminTable
                  emptyText={dict.empty}
                  columns={[
                    { key: "label", label: dict.columns.label },
                    {
                      key: "slug",
                      label: dict.columns.slug,
                      cellClassName: "text-foreground/60",
                    },
                    {
                      key: "sort",
                      label: dict.columns.sort,
                      cellClassName: "text-foreground/60",
                    },
                    { key: "products", label: dict.columns.products },
                    { key: "actions", label: dict.columns.actions },
                  ]}
                  rows={items.map((s) => ({
                    key: s.id,
                    cells: {
                      label: s.label,
                      slug: s.slug,
                      sort: s.sort_order,
                      products: countBySlug.get(s.slug) ?? 0,
                      actions: (
                        <DeleteSubcategoryButton
                          id={s.id}
                          slug={s.slug}
                          label={s.label}
                          dict={dict}
                          common={t.common}
                        />
                      ),
                    },
                  }))}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
