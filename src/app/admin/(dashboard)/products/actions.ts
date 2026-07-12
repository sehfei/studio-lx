"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth";
import {
  productInputToRow,
  uniqueViolationMessage,
  validateProduct,
  type ProductFormState,
  type ProductFormValues,
} from "@/lib/validation/product";

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uploadProductImages(
  files: File[],
  slug: string,
): Promise<{ urls: string[]; paths: string[]; error?: string }> {
  const urls: string[] = [];
  const paths: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { urls, paths, error: `${file.name}：只支持 JPEG / PNG / WEBP / GIF 图片` };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { urls, paths, error: `${file.name}：文件不能超过 5MB` };
    }

    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf("."))
      : ".jpg";
    const path = `${slug}/${crypto.randomUUID()}${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (error) {
      return { urls, paths, error: `图片上传失败：${error.message}` };
    }

    paths.push(path);
    const { data } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls, paths };
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
  await requireAdmin();

  const values = formValues(formData);
  const validated = validateProduct(formToRawInput(formData));
  if (validated.error !== undefined) {
    return { error: validated.error, values };
  }
  const input = validated.data;

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || input.name);

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  let imageUrls: string[] = [];
  let imagePaths: string[] = [];
  if (imageFiles.length > 0) {
    const result = await uploadProductImages(imageFiles, slug);
    if (result.error) {
      await removeUploadedImages(result.paths);
      return { error: result.error, values };
    }
    imageUrls = result.urls;
    imagePaths = result.paths;
  }

  const { error } = await supabaseAdmin
    .from("products")
    .insert(productInputToRow(input, slug, imageUrls));

  if (error) {
    await removeUploadedImages(imagePaths);
    return { error: uniqueViolationMessage(error) ?? error.message, values };
  }

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
  await requireAdmin();

  const values = formValues(formData);
  const validated = validateProduct(formToRawInput(formData));
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

  // 勾选删除的旧图 + 新上传的图，合成最终图片列表
  const removeImages = formData.getAll("removeImages").map(String);
  const keptImages = ((existing.images ?? []) as string[]).filter(
    (url) => !removeImages.includes(url),
  );

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  let newUrls: string[] = [];
  let newPaths: string[] = [];
  if (imageFiles.length > 0) {
    const result = await uploadProductImages(imageFiles, slug);
    if (result.error) {
      await removeUploadedImages(result.paths);
      return { error: result.error, values };
    }
    newUrls = result.urls;
    newPaths = result.paths;
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update(productInputToRow(input, slug, [...keptImages, ...newUrls]))
    .eq("id", id);

  if (error) {
    await removeUploadedImages(newPaths);
    return { error: uniqueViolationMessage(error) ?? error.message, values };
  }

  // 更新成功后才真正删掉被移除的旧图
  await removeUploadedImages(storagePathsFromUrls(removeImages));

  // 新旧分类、新旧 slug 的页面都要刷新
  revalidateCatalog(existing.gender, existing.category, [existing.slug]);
  revalidateCatalog(input.gender, input.category, [slug]);

  redirect("/admin/products");
}

export async function deleteProduct(
  id: string,
): Promise<{ error: string } | undefined> {
  await requireAdmin();

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
    storagePathsFromUrls((existing.images ?? []) as string[]),
  );

  revalidateCatalog(existing.gender, existing.category, [existing.slug]);
}
