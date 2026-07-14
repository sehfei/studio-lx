"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-log";

const BANNER_BUCKET = "site-assets";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export type BannerFormValues = {
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
  sortOrder: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

export type BannerFormState =
  | { error: string; values: BannerFormValues }
  | undefined;

function readValues(formData: FormData): BannerFormValues {
  const s = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    title: s("title"),
    subtitle: s("subtitle"),
    linkUrl: s("linkUrl"),
    linkText: s("linkText"),
    sortOrder: s("sortOrder"),
    isActive: formData.get("isActive") === "on",
    startsAt: s("startsAt"),
    endsAt: s("endsAt"),
  };
}

// banner 图放 site-assets 桶的 banners/ 目录下，每张独立随机文件名。
async function uploadBannerImage(
  file: File,
): Promise<{ url?: string; path?: string; error?: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "只支持 JPEG / PNG / WEBP 图片" };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "图片不能超过 5MB" };
  }
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : ".jpg";
  const path = `banners/${crypto.randomUUID()}${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(BANNER_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) {
    return { error: `图片上传失败：${error.message}` };
  }
  const { data } = supabaseAdmin.storage.from(BANNER_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

async function removeBannerImageByUrl(url: string) {
  const marker = `/object/public/${BANNER_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length));
  await supabaseAdmin.storage.from(BANNER_BUCKET).remove([path]);
}

// 校验时间：填了开始和结束就要求结束晚于开始
function validateDates(values: BannerFormValues): string | null {
  if (values.startsAt && values.endsAt) {
    if (new Date(values.endsAt) <= new Date(values.startsAt)) {
      return "结束时间必须晚于开始时间";
    }
  }
  return null;
}

function toRow(values: BannerFormValues, imageUrl: string) {
  const sortNum = Number(values.sortOrder);
  return {
    image_url: imageUrl,
    title: values.title,
    subtitle: values.subtitle,
    link_url: values.linkUrl,
    link_text: values.linkText,
    sort_order: Number.isFinite(sortNum) ? Math.trunc(sortNum) : 0,
    is_active: values.isActive,
    starts_at: values.startsAt ? new Date(values.startsAt).toISOString() : null,
    ends_at: values.endsAt ? new Date(values.endsAt).toISOString() : null,
  };
}

function revalidateBanner() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createBanner(
  _prevState: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const admin = await requirePermission("banners");
  const values = readValues(formData);

  const dateError = validateDates(values);
  if (dateError) return { error: dateError, values };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "请上传 banner 图片", values };
  }
  const upload = await uploadBannerImage(file);
  if (upload.error) return { error: upload.error, values };

  const { error } = await supabaseAdmin
    .from("banners")
    .insert(toRow(values, upload.url!));
  if (error) {
    // 入库失败清掉刚传的图，避免孤儿文件
    await removeBannerImageByUrl(upload.url!);
    if (error.code === "42P01") {
      return {
        error: "banners 表还没创建，请先在 Supabase 执行最新迁移 SQL",
        values,
      };
    }
    return { error: error.message, values };
  }

  await logAdminAction(admin, {
    action: "banner.create",
    targetType: "banner",
    summary: `新增横幅「${values.title || "（无标题）"}」`,
  });

  revalidateBanner();
  redirect("/admin/banners");
}

export async function updateBanner(
  id: string,
  _prevState: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const admin = await requirePermission("banners");
  const values = readValues(formData);

  const dateError = validateDates(values);
  if (dateError) return { error: dateError, values };

  const { data: existing, error: findError } = await supabaseAdmin
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (findError || !existing) {
    return { error: "banner 不存在", values };
  }

  let imageUrl = existing.image_url as string;
  let oldImageToRemove: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadBannerImage(file);
    if (upload.error) return { error: upload.error, values };
    oldImageToRemove = imageUrl;
    imageUrl = upload.url!;
  }

  const { error } = await supabaseAdmin
    .from("banners")
    .update(toRow(values, imageUrl))
    .eq("id", id);
  if (error) {
    // 更新失败：若刚传了新图则回滚删掉
    if (oldImageToRemove) await removeBannerImageByUrl(imageUrl);
    return { error: error.message, values };
  }

  // 更新成功后才删旧图
  if (oldImageToRemove) await removeBannerImageByUrl(oldImageToRemove);

  await logAdminAction(admin, {
    action: "banner.update",
    targetType: "banner",
    targetId: id,
    summary: `更新横幅「${values.title || "（无标题）"}」`,
  });

  revalidateBanner();
  redirect("/admin/banners");
}

export async function deleteBanner(
  id: string,
): Promise<{ error: string } | undefined> {
  const admin = await requirePermission("banners");

  const { data: existing, error: findError } = await supabaseAdmin
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (findError || !existing) {
    return { error: "banner 不存在" };
  }

  const { error } = await supabaseAdmin.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };

  await removeBannerImageByUrl(existing.image_url as string);

  await logAdminAction(admin, {
    action: "banner.delete",
    targetType: "banner",
    targetId: id,
    summary: `删除横幅（id: ${id}）`,
  });

  revalidateBanner();
}

// 列表页快速开关上下架，不用进编辑页
export async function toggleBannerActive(
  id: string,
  isActive: boolean,
): Promise<{ error: string } | undefined> {
  const admin = await requirePermission("banners");
  const { error } = await supabaseAdmin
    .from("banners")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "banner.toggle_active",
    targetType: "banner",
    targetId: id,
    summary: `横幅${isActive ? "上架" : "下架"}（id: ${id}）`,
  });

  revalidateBanner();
}
