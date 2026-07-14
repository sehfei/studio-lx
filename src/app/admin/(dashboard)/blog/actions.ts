"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-log";
import { slugify } from "@/lib/slugify";
import { dbErrorMessage } from "@/lib/db-error";

// slugify() 只保留 a-z0-9，纯中文标题会被处理成空字符串。
// 博客标题很可能整篇是中文，这里兜底加个随机后缀，保证 slug 永远不为空、不冲突。
function slugifyWithFallback(input: string): string {
  const slug = slugify(input);
  return slug || `post-${crypto.randomUUID().slice(0, 8)}`;
}

const COVER_BUCKET = "site-assets";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
};

export type BlogFormState = { error: string; values: BlogFormValues } | undefined;

function readValues(formData: FormData): BlogFormValues {
  const s = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    title: s("title"),
    slug: s("slug"),
    excerpt: s("excerpt"),
    content: s("content"),
    isPublished: formData.get("isPublished") === "on",
  };
}

async function uploadCoverImage(
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "只支持 JPEG / PNG / WEBP 图片" };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "图片不能超过 5MB" };
  }
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : ".jpg";
  const path = `blog/${crypto.randomUUID()}${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(COVER_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) return { error: `图片上传失败：${error.message}` };
  const { data } = supabaseAdmin.storage.from(COVER_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

async function removeCoverImageByUrl(url: string) {
  const marker = `/object/public/${COVER_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length));
  await supabaseAdmin.storage.from(COVER_BUCKET).remove([path]);
}

function revalidateBlog() {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function createPost(
  _prevState: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const admin = await requirePermission("blog");
  const values = readValues(formData);

  if (!values.title) {
    return { error: "请填写标题", values };
  }
  const slug = slugifyWithFallback(values.slug || values.title);

  let coverImage: string | undefined;
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadCoverImage(file);
    if (upload.error) return { error: upload.error, values };
    coverImage = upload.url;
  }

  const { error } = await supabaseAdmin.from("blog_posts").insert({
    slug,
    title: values.title,
    excerpt: values.excerpt,
    content: values.content,
    cover_image: coverImage ?? null,
    is_published: values.isPublished,
  });

  if (error) {
    if (coverImage) await removeCoverImageByUrl(coverImage);
    if (error.code === "23505") {
      return { error: `Slug "${slug}" 已存在，请换一个标题或手动指定 slug`, values };
    }
    return { error: dbErrorMessage(error), values };
  }

  await logAdminAction(admin, {
    action: "blog.create",
    targetType: "blog_post",
    targetId: slug,
    summary: `新增文章「${values.title}」`,
  });

  revalidateBlog();
  redirect("/admin/blog");
}

export async function updatePost(
  id: string,
  _prevState: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const admin = await requirePermission("blog");
  const values = readValues(formData);

  if (!values.title) {
    return { error: "请填写标题", values };
  }

  const { data: existing, error: findError } = await supabaseAdmin
    .from("blog_posts")
    .select("cover_image")
    .eq("id", id)
    .maybeSingle();
  if (findError || !existing) {
    return { error: "文章不存在", values };
  }

  const slug = slugifyWithFallback(values.slug || values.title);
  let coverImage = existing.cover_image as string | null;
  let oldImageToRemove: string | null = null;

  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadCoverImage(file);
    if (upload.error) return { error: upload.error, values };
    oldImageToRemove = coverImage;
    coverImage = upload.url!;
  }

  const { error } = await supabaseAdmin
    .from("blog_posts")
    .update({
      slug,
      title: values.title,
      excerpt: values.excerpt,
      content: values.content,
      cover_image: coverImage,
      is_published: values.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (oldImageToRemove && coverImage) await removeCoverImageByUrl(coverImage);
    if (error.code === "23505") {
      return { error: `Slug "${slug}" 已存在，请换一个标题或手动指定 slug`, values };
    }
    return { error: dbErrorMessage(error), values };
  }

  if (oldImageToRemove) await removeCoverImageByUrl(oldImageToRemove);

  await logAdminAction(admin, {
    action: "blog.update",
    targetType: "blog_post",
    targetId: slug,
    summary: `更新文章「${values.title}」`,
  });

  revalidateBlog();
  redirect("/admin/blog");
}

export async function deletePost(
  id: string,
): Promise<{ error: string } | undefined> {
  const admin = await requirePermission("blog");

  const { data: existing, error: findError } = await supabaseAdmin
    .from("blog_posts")
    .select("cover_image")
    .eq("id", id)
    .maybeSingle();
  if (findError || !existing) {
    return { error: "文章不存在" };
  }

  const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };

  if (existing.cover_image) {
    await removeCoverImageByUrl(existing.cover_image as string);
  }

  await logAdminAction(admin, {
    action: "blog.delete",
    targetType: "blog_post",
    targetId: id,
    summary: `删除文章（id: ${id}）`,
  });

  revalidateBlog();
}
