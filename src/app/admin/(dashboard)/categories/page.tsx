import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/categories";
import { getSubcategories } from "@/lib/subcategories";
import { getGenders } from "@/lib/genders";
import { AddCategoryForm } from "./AddCategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { AddSubcategoryForm } from "./AddSubcategoryForm";
import { DeleteSubcategoryButton } from "./DeleteSubcategoryButton";
import { AddGenderForm } from "./AddGenderForm";
import { DeleteGenderButton } from "./DeleteGenderButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";
import { CategoryTabs } from "./CategoryTabs";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requirePermission("categories");
  const { t } = await getAdminI18n();
  const navDict = t.sidebar.nav;

  const [
    categories,
    subcategories,
    genders,
    { data: categoryProducts },
    { data: subcategoryProducts },
    { data: genderProducts },
  ] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getGenders(),
    supabaseAdmin.from("products").select("category"),
    supabaseAdmin.from("products").select("subcategory"),
    supabaseAdmin.from("products").select("gender"),
  ]);

  const categoryCountBySlug = new Map<string, number>();
  for (const p of categoryProducts ?? []) {
    categoryCountBySlug.set(
      p.category,
      (categoryCountBySlug.get(p.category) ?? 0) + 1,
    );
  }

  const subcategoryCountBySlug = new Map<string, number>();
  for (const p of subcategoryProducts ?? []) {
    if (!p.subcategory) continue;
    subcategoryCountBySlug.set(
      p.subcategory,
      (subcategoryCountBySlug.get(p.subcategory) ?? 0) + 1,
    );
  }

  const genderCountBySlug = new Map<string, number>();
  for (const p of genderProducts ?? []) {
    genderCountBySlug.set(
      p.gender,
      (genderCountBySlug.get(p.gender) ?? 0) + 1,
    );
  }

  const categoriesDict = t.pages.categories;
  const subcategoriesDict = t.pages.subcategories;
  const gendersDict = t.pages.genders;

  const genderLabels = (slugs: string[]) =>
    slugs.length === 0
      ? "—"
      : slugs
          .map((slug) => genders.find((g) => g.slug === slug)?.label ?? slug)
          .join(", ");

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{categoriesDict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{categoriesDict.desc}</p>

      <CategoryTabs
        tabs={[
          {
            key: "categories",
            label: navDict.categories,
            content: (
              <div>
                <div className="mb-8 border border-border-subtle p-4">
                  <p className="eyebrow mb-3">{categoriesDict.addNew}</p>
                  <AddCategoryForm
                    genders={genders}
                    dict={categoriesDict}
                    common={t.common}
                  />
                </div>

                <AdminTable
                  emptyText={categoriesDict.empty}
                  columns={[
                    { key: "label", label: categoriesDict.columns.label },
                    {
                      key: "slug",
                      label: categoriesDict.columns.slug,
                      cellClassName: "text-foreground/60",
                    },
                    {
                      key: "sort",
                      label: categoriesDict.columns.sort,
                      cellClassName: "text-foreground/60",
                    },
                    {
                      key: "genders",
                      label: categoriesDict.columns.genders,
                      cellClassName: "text-foreground/60",
                    },
                    { key: "products", label: categoriesDict.columns.products },
                    { key: "actions", label: categoriesDict.columns.actions },
                  ]}
                  rows={categories.map((c) => ({
                    key: c.id,
                    cells: {
                      label: c.label,
                      slug: c.slug,
                      sort: c.sort_order,
                      genders: genderLabels(c.genders),
                      products: categoryCountBySlug.get(c.slug) ?? 0,
                      actions: (
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/categories/${c.id}/edit`}
                            className="text-xs text-foreground/60 hover:text-gold hover:underline"
                          >
                            {t.common.edit}
                          </Link>
                          <DeleteCategoryButton
                            id={c.id}
                            slug={c.slug}
                            label={c.label}
                            dict={categoriesDict}
                            common={t.common}
                          />
                        </div>
                      ),
                    },
                  }))}
                />
              </div>
            ),
          },
          {
            key: "subcategories",
            label: navDict.subcategories,
            content:
              categories.length === 0 ? (
                <p className="text-sm text-foreground/50">
                  {subcategoriesDict.noCategoriesYet}
                </p>
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
                            genders={genders}
                            dict={subcategoriesDict}
                            common={t.common}
                          />
                        </div>

                        <AdminTable
                          emptyText={subcategoriesDict.empty}
                          columns={[
                            {
                              key: "label",
                              label: subcategoriesDict.columns.label,
                            },
                            {
                              key: "slug",
                              label: subcategoriesDict.columns.slug,
                              cellClassName: "text-foreground/60",
                            },
                            {
                              key: "sort",
                              label: subcategoriesDict.columns.sort,
                              cellClassName: "text-foreground/60",
                            },
                            {
                              key: "genders",
                              label: subcategoriesDict.columns.genders,
                              cellClassName: "text-foreground/60",
                            },
                            {
                              key: "products",
                              label: subcategoriesDict.columns.products,
                            },
                            {
                              key: "actions",
                              label: subcategoriesDict.columns.actions,
                            },
                          ]}
                          rows={items.map((s) => ({
                            key: s.id,
                            cells: {
                              label: s.label,
                              slug: s.slug,
                              sort: s.sort_order,
                              genders: genderLabels(s.genders),
                              products: subcategoryCountBySlug.get(s.slug) ?? 0,
                              actions: (
                                <div className="flex items-center gap-3">
                                  <Link
                                    href={`/admin/categories/subcategory/${s.id}/edit`}
                                    className="text-xs text-foreground/60 hover:text-gold hover:underline"
                                  >
                                    {t.common.edit}
                                  </Link>
                                  <DeleteSubcategoryButton
                                    id={s.id}
                                    slug={s.slug}
                                    label={s.label}
                                    dict={subcategoriesDict}
                                    common={t.common}
                                  />
                                </div>
                              ),
                            },
                          }))}
                        />
                      </div>
                    );
                  })}
                </div>
              ),
          },
          {
            key: "genders",
            label: navDict.genders,
            content: (
              <div>
                <div className="mb-8 border border-border-subtle p-4">
                  <p className="eyebrow mb-3">{gendersDict.addNew}</p>
                  <AddGenderForm dict={gendersDict} common={t.common} />
                </div>

                <AdminTable
                  emptyText={gendersDict.empty}
                  columns={[
                    { key: "label", label: gendersDict.columns.label },
                    {
                      key: "slug",
                      label: gendersDict.columns.slug,
                      cellClassName: "text-foreground/60",
                    },
                    {
                      key: "sort",
                      label: gendersDict.columns.sort,
                      cellClassName: "text-foreground/60",
                    },
                    { key: "products", label: gendersDict.columns.products },
                    { key: "actions", label: gendersDict.columns.actions },
                  ]}
                  rows={genders.map((g) => ({
                    key: g.id,
                    cells: {
                      label: g.label,
                      slug: g.slug,
                      sort: g.sort_order,
                      products: genderCountBySlug.get(g.slug) ?? 0,
                      actions: (
                        <DeleteGenderButton
                          id={g.id}
                          slug={g.slug}
                          label={g.label}
                          dict={gendersDict}
                          common={t.common}
                        />
                      ),
                    },
                  }))}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
