import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getGenders } from "@/lib/genders";
import type { SubcategoryRow } from "@/lib/subcategories";
import { AddSubcategoryForm } from "../../../AddSubcategoryForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "Edit Sub-Category" };
export const dynamic = "force-dynamic";

export default async function EditSubcategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("categories");
  const { id } = await params;

  const [{ data: subcategory }, genders, { t }] = await Promise.all([
    supabaseAdmin.from("subcategories").select("*").eq("id", id).maybeSingle(),
    getGenders(),
    getAdminI18n(),
  ]);
  if (!subcategory) notFound();

  const dict = t.pages.subcategories;

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.editPageTitle}</h1>
      <div className="border border-border-subtle p-4">
        <AddSubcategoryForm
          category={subcategory.category}
          subcategory={subcategory as SubcategoryRow}
          genders={genders}
          dict={dict}
          common={t.common}
        />
      </div>
    </div>
  );
}
