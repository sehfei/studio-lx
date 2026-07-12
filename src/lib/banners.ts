import { supabase } from "@/lib/supabase/client";

export type Banner = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type BannerRow = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  link_text: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export function mapBannerRow(row: BannerRow): Banner {
  return {
    id: row.id,
    imageUrl: row.image_url,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    linkUrl: row.link_url ?? "",
    linkText: row.link_text ?? "",
    sortOrder: row.sort_order,
    isActive: row.is_active,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
  };
}

// 后台：全部 banner，按排序值升序（数字小的排前面）
export async function getAllBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapBannerRow);
}

export async function getBannerById(id: string): Promise<Banner | undefined> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;
  return mapBannerRow(data);
}

// 前台：当前生效中的 banner（开启 + 在时间窗内），按排序值升序
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []).map(mapBannerRow);
  } catch {
    return [];
  }
}
