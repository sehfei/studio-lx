"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { dbErrorMessage } from "@/lib/db-error";
import { logAdminAction } from "@/lib/audit-log";

export type GenderFormState = { error?: string } | undefined;

export async function createGender(
  _prevState: GenderFormState,
  formData: FormData,
): Promise<GenderFormState> {
  const admin = await requirePermission("genders");

  const label = String(formData.get("label") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!label) {
    return { error: "请填写分区名称" };
  }
  const slug = slugify(slugInput || label);
  if (!slug) {
    return { error: "无法从名称生成有效的 slug，请手动指定" };
  }

  const { error } = await supabaseAdmin.from("genders").insert({
    slug,
    label,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `分区 "${slug}" 已存在` };
    }
    return { error: dbErrorMessage(error) };
  }

  await logAdminAction(admin, {
    action: "gender.create",
    targetType: "gender",
    targetId: slug,
    summary: `新增性别分区「${label}」`,
    summaryParams: { label },
  });

  revalidatePath("/admin/genders");
  revalidatePath("/", "layout");
  return undefined;
}

export async function deleteGender(
  id: string,
  slug: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("genders");

  const { count } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("gender", slug);

  if (count && count > 0) {
    return {
      error: `还有 ${count} 个商品在用这个分区，不能删除。先把商品改到其他分区。`,
    };
  }

  const { error } = await supabaseAdmin
    .from("genders")
    .delete()
    .eq("id", id);
  if (error) return { error: dbErrorMessage(error) };

  await logAdminAction(admin, {
    action: "gender.delete",
    targetType: "gender",
    targetId: slug,
    summary: `删除性别分区「${slug}」`,
    summaryParams: { slug },
  });

  revalidatePath("/admin/genders");
  revalidatePath("/", "layout");
}
