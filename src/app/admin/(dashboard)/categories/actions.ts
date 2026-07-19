"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { dbErrorMessage } from "@/lib/db-error";
import { logAdminAction } from "@/lib/audit-log";

export type CategoryFormState = { error?: string } | undefined;

// 性别勾选框 name="genders"，勾了几个就有几个同名字段，getAll 一次性读出来
function readGenders(formData: FormData): string[] {
  return formData.getAll("genders").map(String);
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requirePermission("categories");

  const label = String(formData.get("label") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const genders = readGenders(formData);

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
    genders,
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
    summaryParams: { label },
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
    summaryParams: { slug },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

// 编辑只改名称/排序/性别，slug 不让改——products/subcategories 都用 slug 引用分类，
// 改了会跟已有数据对不上。
export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requirePermission("categories");

  const label = String(formData.get("label") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const genders = readGenders(formData);

  if (!label) {
    return { error: "请填写分类名称" };
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .update({
      label,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      genders,
    })
    .eq("id", id);
  if (error) return { error: dbErrorMessage(error) };

  await logAdminAction(admin, {
    action: "category.update",
    targetType: "category",
    targetId: id,
    summary: `更新分类「${label}」`,
    summaryParams: { label },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return undefined;
}

export type SubcategoryFormState = { error?: string } | undefined;

export async function createSubcategory(
  _prevState: SubcategoryFormState,
  formData: FormData,
): Promise<SubcategoryFormState> {
  const admin = await requirePermission("categories");

  const category = String(formData.get("category") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const genders = readGenders(formData);

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
    genders,
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
    summaryParams: { label, category },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return undefined;
}

export async function deleteSubcategory(
  id: string,
  slug: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("categories");

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
    summaryParams: { slug },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

// 编辑只改名称/排序/性别，slug 和所属分类不让改，理由同 updateCategory。
export async function updateSubcategory(
  id: string,
  _prevState: SubcategoryFormState,
  formData: FormData,
): Promise<SubcategoryFormState> {
  const admin = await requirePermission("categories");

  const label = String(formData.get("label") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const genders = readGenders(formData);

  if (!label) {
    return { error: "请填写子分类名称" };
  }

  const { error } = await supabaseAdmin
    .from("subcategories")
    .update({
      label,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      genders,
    })
    .eq("id", id);
  if (error) return { error: dbErrorMessage(error) };

  await logAdminAction(admin, {
    action: "subcategory.update",
    targetType: "subcategory",
    targetId: id,
    summary: `更新子分类「${label}」`,
    summaryParams: { label },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return undefined;
}

export type GenderFormState = { error?: string } | undefined;

export async function createGender(
  _prevState: GenderFormState,
  formData: FormData,
): Promise<GenderFormState> {
  const admin = await requirePermission("categories");

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

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return undefined;
}

export async function deleteGender(
  id: string,
  slug: string,
): Promise<{ error?: string } | undefined> {
  const admin = await requirePermission("categories");

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

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
