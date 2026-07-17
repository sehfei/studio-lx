import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getGenders } from "@/lib/genders";
import { AddGenderForm } from "./AddGenderForm";
import { DeleteGenderButton } from "./DeleteGenderButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminGendersPage() {
  await requirePermission("genders");
  const { t } = await getAdminI18n();
  const dict = t.pages.genders;
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
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">{dict.addNew}</p>
        <AddGenderForm dict={dict} common={t.common} />
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
        rows={genders.map((g) => ({
          key: g.id,
          cells: {
            label: g.label,
            slug: g.slug,
            sort: g.sort_order,
            products: countBySlug.get(g.slug) ?? 0,
            actions: (
              <DeleteGenderButton
                id={g.id}
                slug={g.slug}
                label={g.label}
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
