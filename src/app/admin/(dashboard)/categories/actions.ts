"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { dbErrorMessage } from "@/lib/db-error";
import { logAdminAction } from "@/lib/audit-log";

export type CategoryFormState = { error?: string } | undefined;

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requirePermission("categories");

  const label = String(formData.get("label") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!label) {
    return { error: "请填写分类名称" };
  }
  const slug = slugify(slugInput || label);
  if (!slug) {
    return { error: "无法从名称生成有效的 slug，请手动指定" };
  }

  const { error } = await supabaseAdmin.from("categories").insert({
    slug,
    label,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `分类 "${slug}" 已存在` };
    }
    return { error: dbErrorMessage(error) };
  }

  await logAdminAction(admin, {
    action: "category.create",
    targetType: "category",
    targetId: slug,
    summary: `新增分类「${label}」`,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return undefined;
}

export async function deleteCategory(
  id: string,
  slug: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("categories");

  const { count } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);

  if (count && count > 0) {
    return {
      error: `还有 ${count} 个商品在用这个分类，不能删除。先把商品改到其他分类。`,
    };
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) return { error: dbErrorMessage(error) };

  await logAdminAction(admin, {
    action: "category.delete",
    targetType: "category",
    targetId: slug,
    summary: `删除分类「${slug}」`,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
