"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dbErrorMessage } from "@/lib/db-error";
import {
  BUTTON_STYLE_OPTIONS,
  contrastRatio,
  DENSITY_OPTIONS,
  FONT_PRESETS,
  RADIUS_OPTIONS,
  type ThemeSettings,
} from "@/lib/theme";
import type { AnnouncementSettings } from "@/lib/announcement";
import type { SiteIdentity } from "@/lib/identity";
import type { PageContent, PageKey, SitePages } from "@/lib/pages";

export type ThemeFormState =
  | { error?: string; success?: string }
  | undefined;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function readColors(formData: FormData) {
  const keys = [
    "background",
    "foreground",
    "primary",
    "accent",
    "border",
    "muted",
    "destructive",
  ] as const;
  const colors = {} as ThemeSettings["colors"];
  for (const key of keys) {
    const value = String(formData.get(`color-${key}`) ?? "").trim();
    if (!HEX_RE.test(value)) {
      return { error: `颜色「${key}」格式不对，必须是 #RRGGBB` };
    }
    colors[key] = value.toLowerCase();
  }
  return { colors };
}

async function persistTheme(theme: ThemeSettings): Promise<string | null> {
  // 保存前先把当前存档挪到 previous_theme，实现一层「撤销上一次保存」
  const { data: current } = await supabaseAdmin
    .from("site_settings")
    .select("theme")
    .eq("id", 1)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("site_settings").upsert({
    id: 1,
    theme,
    previous_theme: current?.theme ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) return dbErrorMessage(error);

  // 主题变量注入在根布局，刷新全站
  revalidatePath("/", "layout");
  return null;
}

export async function undoLastSave(): Promise<ThemeFormState> {
  await requirePermission("settings");

  const { data, error: findError } = await supabaseAdmin
    .from("site_settings")
    .select("theme, previous_theme")
    .eq("id", 1)
    .maybeSingle();
  if (findError) return { error: dbErrorMessage(findError) };
  if (!data?.previous_theme) {
    return { error: "没有可撤销的保存记录" };
  }

  // 和当前值互换，所以再点一次等于「重做」
  const { error } = await supabaseAdmin
    .from("site_settings")
    .update({
      theme: data.previous_theme,
      previous_theme: data.theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: dbErrorMessage(error) };

  revalidatePath("/", "layout");
  return { success: "已撤销上一次保存" };
}

export async function saveTheme(
  _prevState: ThemeFormState,
  formData: FormData,
): Promise<ThemeFormState> {
  await requirePermission("settings");

  const parsed = readColors(formData);
  if ("error" in parsed) return { error: parsed.error };
  const colors = parsed.colors;

  // 防呆：正文文字必须能看清
  const ratio = contrastRatio(colors.foreground, colors.background);
  if (ratio < 4.5) {
    return {
      error: `文字色和背景色对比度只有 ${ratio.toFixed(1)}:1（至少要 4.5:1），手机上会看不清字，请调整`,
    };
  }

  const fontPreset = String(formData.get("fontPreset") ?? "");
  if (!FONT_PRESETS.some((f) => f.id === fontPreset)) {
    return { error: "请选择字体组合" };
  }

  const radius = Number(formData.get("radius"));
  if (!RADIUS_OPTIONS.includes(radius as (typeof RADIUS_OPTIONS)[number])) {
    return { error: "圆角档位无效" };
  }

  const density = String(formData.get("density") ?? "");
  if (!DENSITY_OPTIONS.some((d) => d.id === density)) {
    return { error: "间距档位无效" };
  }

  const buttonStyle = String(formData.get("buttonStyle") ?? "");
  if (!BUTTON_STYLE_OPTIONS.some((b) => b.id === buttonStyle)) {
    return { error: "按钮风格无效" };
  }

  const theme: ThemeSettings = {
    colors,
    fontPreset: fontPreset as ThemeSettings["fontPreset"],
    radius,
    density: density as ThemeSettings["density"],
    buttonStyle: buttonStyle as ThemeSettings["buttonStyle"],
  };

  const dbError = await persistTheme(theme);
  if (dbError) return { error: dbError };

  return { success: "已保存，全站生效" };
}

export type AnnouncementFormState =
  | { error?: string; success?: string }
  | undefined;

export async function saveAnnouncement(
  _prevState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  await requirePermission("settings");

  const message = String(formData.get("message") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const linkText = String(formData.get("linkText") ?? "").trim();

  if (enabled && !message) {
    return { error: "要开启公告，先填写公告内容" };
  }
  if (linkUrl && !linkText) {
    return { error: "填了链接地址，也要填按钮文字" };
  }

  const announcement: AnnouncementSettings = {
    enabled,
    message,
    linkUrl: linkUrl || undefined,
    linkText: linkText || undefined,
    // 内容变了就换个版本号，之前关掉公告的顾客会重新看到新内容
    updatedAt: Date.now(),
  };

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, announcement, updated_at: new Date().toISOString() });
  if (error) return { error: dbErrorMessage(error) };

  revalidatePath("/", "layout");
  return { success: "已保存，全站生效" };
}

export type IdentityFormState =
  | { error?: string; success?: string }
  | undefined;

const ASSET_BUCKET = "site-assets";
const MAX_ASSET_SIZE = 2 * 1024 * 1024; // 2MB，logo/favicon/hero 不需要很大
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_FAVICON_TYPES = [...ALLOWED_IMAGE_TYPES, "image/x-icon", "image/vnd.microsoft.icon"];

// logo/favicon/hero 都是「只有一份」的单例资源，每种固定放在自己的目录
// （logo/、favicon/、hero/）下。换图片时扩展名可能变（.png -> .jpg），
// 所以每次都先清空该目录下所有旧文件，再传新的，不会留下孤儿文件。
async function clearSiteAssetDir(kind: "logo" | "favicon" | "hero") {
  const { data } = await supabaseAdmin.storage.from(ASSET_BUCKET).list(kind);
  const paths = (data ?? []).map((f) => `${kind}/${f.name}`);
  if (paths.length > 0) {
    await supabaseAdmin.storage.from(ASSET_BUCKET).remove(paths);
  }
}

async function uploadSiteAsset(
  file: File,
  kind: "logo" | "favicon" | "hero",
): Promise<{ url?: string; error?: string }> {
  const allowed = kind === "favicon" ? ALLOWED_FAVICON_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    return { error: `${file.name}：图片格式不支持` };
  }
  if (file.size > MAX_ASSET_SIZE) {
    return { error: `${file.name}：文件不能超过 2MB` };
  }

  await clearSiteAssetDir(kind);

  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : ".png";
  const path = `${kind}/current${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(ASSET_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) {
    return { error: `${file.name} 上传失败：${error.message}` };
  }

  const { data } = supabaseAdmin.storage.from(ASSET_BUCKET).getPublicUrl(path);
  // 固定路径覆盖后浏览器/CDN 可能还缓存旧图，加个版本号强制刷新
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

export async function saveIdentity(
  _prevState: IdentityFormState,
  formData: FormData,
): Promise<IdentityFormState> {
  await requirePermission("settings");

  const { data: current } = await supabaseAdmin
    .from("site_settings")
    .select("identity")
    .eq("id", 1)
    .maybeSingle();
  const existing = (current?.identity ?? {}) as Partial<SiteIdentity>;

  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();
  if (!/^[0-9]{8,15}$/.test(whatsappNumber)) {
    return { error: "WhatsApp 号码只能是数字，包含国家代码，例如 60123456789" };
  }

  const str = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v || undefined;
  };

  const identity: SiteIdentity = {
    whatsappNumber,
    instagramUrl: str("instagramUrl"),
    facebookUrl: str("facebookUrl"),
    tiktokUrl: str("tiktokUrl"),
    gaId: str("gaId"),
    metaPixelId: str("metaPixelId"),
    logoUrl: existing.logoUrl,
    faviconUrl: existing.faviconUrl,
    heroImageUrl: existing.heroImageUrl,
  };

  const assets: { field: "logoUrl" | "faviconUrl" | "heroImageUrl"; file: string; remove: string; kind: "logo" | "favicon" | "hero" }[] = [
    { field: "logoUrl", file: "logoFile", remove: "removeLogo", kind: "logo" },
    { field: "faviconUrl", file: "faviconFile", remove: "removeFavicon", kind: "favicon" },
    { field: "heroImageUrl", file: "heroFile", remove: "removeHero", kind: "hero" },
  ];

  for (const asset of assets) {
    const file = formData.get(asset.file);
    if (file instanceof File && file.size > 0) {
      const result = await uploadSiteAsset(file, asset.kind);
      if (result.error) return { error: result.error };
      identity[asset.field] = result.url;
    } else if (formData.get(asset.remove) === "on") {
      await clearSiteAssetDir(asset.kind);
      identity[asset.field] = undefined;
    }
  }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, identity, updated_at: new Date().toISOString() });
  if (error) return { error: dbErrorMessage(error) };

  revalidatePath("/", "layout");
  return { success: "已保存，全站生效" };
}

export type PagesFormState =
  | { error?: string; success?: string }
  | undefined;

const PAGE_KEYS: PageKey[] = ["about", "shipping"];

export async function savePages(
  _prevState: PagesFormState,
  formData: FormData,
): Promise<PagesFormState> {
  await requirePermission("settings");

  const s = (name: string) => String(formData.get(name) ?? "").trim();
  const pages = {} as SitePages;
  for (const key of PAGE_KEYS) {
    const content: PageContent = {
      titleEn: s(`${key}-titleEn`),
      titleZh: s(`${key}-titleZh`),
      bodyEn: s(`${key}-bodyEn`),
      bodyZh: s(`${key}-bodyZh`),
    };
    pages[key] = content;
  }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, pages, updated_at: new Date().toISOString() });
  if (error) return { error: dbErrorMessage(error) };

  revalidatePath("/", "layout");
  return { success: "已保存，全站生效" };
}
