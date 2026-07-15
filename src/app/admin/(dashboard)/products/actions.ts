"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { requirePermission } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-log";
import {
  productInputToRow,
  uniqueViolationMessage,
  validateProduct,
  type ProductFormState,
  type ProductFormValues,
} from "@/lib/validation/product";
import type { ProductImage } from "@/lib/products";

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

async function getValidCategorySlugs(): Promise<string[]> {
  const { data } = await supabaseAdmin.from("categories").select("slug");
  return (data ?? []).map((c) => c.slug);
}

async function getValidGenderSlugs(): Promise<string[]> {
  const { data } = await supabaseAdmin.from("genders").select("slug");
  return (data ?? []).map((g) => g.slug);
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uploadProductImages(
  files: File[],
  alts: string[],
  fallbackAlt: string,
  slug: string,
): Promise<{ images: ProductImage[]; paths: string[]; error?: string }> {
  const images: ProductImage[] = [];
  const paths: string[] = [];

  for (const [i, file] of files.entries()) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { images, paths, error: `${file.name}：只支持 JPEG / PNG / WEBP / GIF 图片` };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { images, paths, error: `${file.name}：文件不能超过 5MB` };
    }

    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf("."))
      : ".jpg";
    const path = `${slug}/${crypto.randomUUID()}${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (error) {
      return { images, paths, error: `图片上传失败：${error.message}` };
    }

    paths.push(path);
    const { data } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    images.push({ url: data.publicUrl, alt: (alts[i] ?? "").trim() || fallbackAlt });
  }

  return { images, paths };
}

// 上传后 insert 失败时清掉已传的图片，避免 storage 里留孤儿文件
async function removeUploadedImages(paths: string[]) {
  if (paths.length === 0) return;
  await supabaseAdmin.storage.from(IMAGE_BUCKET).remove(paths);
}

// 从公开 URL 反推 storage 内的路径，用于删除旧图
function storagePathsFromUrls(urls: string[]): string[] {
  const marker = `/object/public/${IMAGE_BUCKET}/`;
  return urls
    .map((url) => {
      const i = url.indexOf(marker);
      return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
    })
    .filter((p): p is string => p !== null);
}

function revalidateCatalog(
  gender: string,
  category: string,
  slugs: string[] = [],
) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/${gender}`);
  revalidatePath(`/${gender}/${category}`);
  revalidatePath("/new-arrival");
  revalidatePath("/best-seller");
  revalidatePath("/promotion");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    revalidatePath(`/product/${slug}`);
  }
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  // proxy 和 layout 挡不住直接调用 action，这里必须再验一次
  const admin = await requirePermission("products");

  const values = formValues(formData);
  const [validCategories, validGenders] = await Promise.all([
    getValidCategorySlugs(),
    getValidGenderSlugs(),
  ]);
  const validated = validateProduct(
    formToRawInput(formData),
    validCategories,
    validGenders,
  );
  if (validated.error !== undefined) {
    return { error: validated.error, values };
  }
  const input = validated.data;

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || input.name);

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const imageAlts = formData.getAll("newImageAlts").map(String);

  let images: ProductImage[] = [];
  let imagePaths: string[] = [];
  if (imageFiles.length > 0) {
    const result = await uploadProductImages(
      imageFiles,
      imageAlts,
      input.name,
      slug,
    );
    if (result.error) {
      await removeUploadedImages(result.paths);
      return { error: result.error, values };
    }
    images = result.images;
    imagePaths = result.paths;
  }

  const { error } = await supabaseAdmin
    .from("products")
    .insert(productInputToRow(input, slug, images));

  if (error) {
    await removeUploadedImages(imagePaths);
    return { error: uniqueViolationMessage(error) ?? error.message, values };
  }

  await logAdminAction(admin, {
    action: "product.create",
    targetType: "product",
    targetId: slug,
    summary: `新增商品「${input.name}」(SKU: ${input.sku})`,
  });

  revalidateCatalog(input.gender, input.category);

  redirect("/admin/products");
}

// 表单字段 -> validateProduct 的输入（新增和编辑共用）
function formToRawInput(formData: FormData) {
  return {
    name: formData.get("name"),
    sku: formData.get("sku"),
    brand: formData.get("brand"),
    description: formData.get("description"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice"),
    stock: formData.get("stock"),
    gender: formData.get("gender"),
    category: formData.get("category"),
    colors: splitList(String(formData.get("colors") ?? "")),
    sizes: splitList(String(formData.get("sizes") ?? "")),
    material: formData.get("material"),
    weight: formData.get("weight"),
    shippingInfo: formData.get("shippingInfo"),
    tags: formData.getAll("tags").map(String),
    badgeText: formData.get("badgeText"),
  };
}

// 表单原始字符串值，报错时随错误返回用于回填
function formValues(formData: FormData): ProductFormValues {
  const s = (name: string) => String(formData.get(name) ?? "");
  return {
    name: s("name"),
    slug: s("slug"),
    sku: s("sku"),
    brand: s("brand"),
    description: s("description"),
    price: s("price"),
    discountPrice: s("discountPrice"),
    stock: s("stock"),
    gender: s("gender"),
    category: s("category"),
    colors: s("colors"),
    sizes: s("sizes"),
    material: s("material"),
    weight: s("weight"),
    shippingInfo: s("shippingInfo"),
    tags: formData.getAll("tags").map(String),
    badgeText: s("badgeText"),
  };
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requirePermission("products");

  const values = formValues(formData);
  const [validCategories, validGenders] = await Promise.all([
    getValidCategorySlugs(),
    getValidGenderSlugs(),
  ]);
  const validated = validateProduct(
    formToRawInput(formData),
    validCategories,
    validGenders,
  );
  if (validated.error !== undefined) {
    return { error: validated.error, values };
  }
  const input = validated.data;

  const { data: existing, error: findError } = await supabaseAdmin
    .from("products")
    .select("slug, gender, category, images")
    .eq("id", id)
    .maybeSingle();
  if (findError || !existing) {
    return { error: "商品不存在", values };
  }

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || input.name);

  // 勾选删除的旧图 + 改过的 alt 文字 + 新上传的图，合成最终图片列表
  const removeImages = formData.getAll("removeImages").map(String);
  const existingUrls = formData.getAll("existingImageUrl").map(String);
  const existingAlts = formData.getAll("existingImageAlt").map(String);
  const altByUrl = new Map(existingUrls.map((url, i) => [url, existingAlts[i] ?? ""]));
  const keptImages = ((existing.images ?? []) as ProductImage[])
    .filter((img) => !removeImages.includes(img.url))
    .map((img) => ({
      url: img.url,
      alt: altByUrl.get(img.url)?.trim() || img.alt,
    }));

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const imageAlts = formData.getAll("newImageAlts").map(String);

  let newImages: ProductImage[] = [];
  let newPaths: string[] = [];
  if (imageFiles.length > 0) {
    const result = await uploadProductImages(
      imageFiles,
      imageAlts,
      input.name,
      slug,
    );
    if (result.error) {
      await removeUploadedImages(result.paths);
      return { error: result.error, values };
    }
    newImages = result.images;
    newPaths = result.paths;
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update(productInputToRow(input, slug, [...keptImages, ...newImages]))
    .eq("id", id);

  if (error) {
    await removeUploadedImages(newPaths);
    return { error: uniqueViolationMessage(error) ?? error.message, values };
  }

  // 更新成功后才真正删掉被移除的旧图
  await removeUploadedImages(storagePathsFromUrls(removeImages));

  await logAdminAction(admin, {
    action: "product.update",
    targetType: "product",
    targetId: slug,
    summary: `更新商品「${input.name}」(SKU: ${input.sku})`,
  });

  // 新旧分类、新旧 slug 的页面都要刷新
  revalidateCatalog(existing.gender, existing.category, [existing.slug]);
  revalidateCatalog(input.gender, input.category, [slug]);

  redirect("/admin/products");
}

export async function deleteProduct(
  id: string,
): Promise<{ error: string } | undefined> {
  const admin = await requirePermission("products");

  const { data: existing, error: findError } = await supabaseAdmin
    .from("products")
    .select("slug, gender, category, images")
    .eq("id", id)
    .maybeSingle();
  if (findError || !existing) {
    return { error: "商品不存在" };
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  await removeUploadedImages(
    storagePathsFromUrls(
      ((existing.images ?? []) as ProductImage[]).map((img) => img.url),
    ),
  );

  await logAdminAction(admin, {
    action: "product.delete",
    targetType: "product",
    targetId: existing.slug,
    summary: `删除商品（slug: ${existing.slug}）`,
  });

  revalidateCatalog(existing.gender, existing.category, [existing.slug]);
}
