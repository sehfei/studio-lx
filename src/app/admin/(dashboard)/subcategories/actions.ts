"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { dbErrorMessage } from "@/lib/db-error";
import { logAdminAction } from "@/lib/audit-log";

export type SubcategoryFormState = { error?: string } | undefined;

export async function createSubcategory(
  _prevState: SubcategoryFormState,
  formData: FormData,
): Promise<SubcategoryFormState> {
  const admin = await requirePermission("subcategories");

  const category = String(formData.get("category") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!category) {
    return { error: "请选择所属分类" };
  }
  if (!label) {
    return { error: "请填写子分类名称" };
  }
  const slug = slugify(slugInput || label);
  if (!slug) {
    return { error: "无法从名称生成有效的 slug，请手动指定" };
  }

  const { error } = await supabaseAdmin.from("subcategories").insert({
    category,
    slug,
    label,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `子分类 "${slug}" 已存在，换一个名称` };
    }
    return { error: dbErrorMessage(error) };
  }

  await logAdminAction(admin, {
    action: "subcategory.create",
    targetType: "subcategory",
    targetId: slug,
    summary: `新增子分类「${label}」（属于 ${category}）`,
  });

  revalidatePath("/admin/subcategories");
  revalidatePath("/", "layout");
  return undefined;
}

export async function deleteSubcategory(
  id: string,
  slug: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("subcategories");

  const { count } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("subcategory", slug);

  if (count && count > 0) {
    return {
      error: `还有 ${count} 个商品在用这个子分类，不能删除。先把商品改到其他子分类。`,
    };
  }

  const { error } = await supabaseAdmin
    .from("subcategories")
    .delete()
    .eq("id", id);
  if (error) return { error: dbErrorMessage(error) };

  await logAdminAction(admin, {
    action: "subcategory.delete",
    targetType: "subcategory",
    targetId: slug,
    summary: `删除子分类「${slug}」`,
  });

  revalidatePath("/admin/subcategories");
  revalidatePath("/", "layout");
}
