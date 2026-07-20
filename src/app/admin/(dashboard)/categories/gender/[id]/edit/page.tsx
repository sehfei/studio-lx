import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GenderRow } from "@/lib/genders";
import { AddGenderForm } from "../../../AddGenderForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "Edit Gender Section" };
export const dynamic = "force-dynamic";

export default async function EditGenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("categories");
  const { id } = await params;

  const [{ data: gender }, { t }] = await Promise.all([
    supabaseAdmin.from("genders").select("*").eq("id", id).maybeSingle(),
    getAdminI18n(),
  ]);
  if (!gender) notFound();

  const dict = t.pages.genders;

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.editPageTitle}</h1>
      <div className="border border-border-subtle p-4">
        <AddGenderForm
          gender={gender as GenderRow}
          dict={dict}
          common={t.common}
        />
      </div>
    </div>
  );
}
