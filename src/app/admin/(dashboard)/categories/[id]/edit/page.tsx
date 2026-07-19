import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getGenders } from "@/lib/genders";
import type { CategoryRow } from "@/lib/categories";
import { AddCategoryForm } from "../../AddCategoryForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "Edit Category" };
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("categories");
  const { id } = await params;

  const [{ data: category }, genders, { t }] = await Promise.all([
    supabaseAdmin.from("categories").select("*").eq("id", id).maybeSingle(),
    getGenders(),
    getAdminI18n(),
  ]);
  if (!category) notFound();

  const dict = t.pages.categories;

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.editPageTitle}</h1>
      <div className="border border-border-subtle p-4">
        <AddCategoryForm
          category={category as CategoryRow}
          genders={genders}
          dict={dict}
          common={t.common}
        />
      </div>
    </div>
  );
}
