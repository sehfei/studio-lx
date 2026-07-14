import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

export type AnnouncementSettings = {
  enabled: boolean;
  message: string;
  linkUrl?: string;
  linkText?: string;
  // 内容更新的时间戳，作为顾客关闭公告后的“版本号”：
  // 内容变了顾客又会重新看到，而不是永久隐藏。
  updatedAt: number;
};

export const DEFAULT_ANNOUNCEMENT: AnnouncementSettings = {
  enabled: false,
  message: "",
  updatedAt: 0,
};

function mergeAnnouncement(partial: unknown): AnnouncementSettings {
  const p = (partial ?? {}) as Partial<AnnouncementSettings>;
  return {
    enabled: p.enabled === true,
    message: typeof p.message === "string" ? p.message : "",
    linkUrl: typeof p.linkUrl === "string" ? p.linkUrl : undefined,
    linkText: typeof p.linkText === "string" ? p.linkText : undefined,
    updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : 0,
  };
}

export const getAnnouncement = cache(async (): Promise<AnnouncementSettings> => {
  try {
    const { data, error } = await supabase
      .from("announcement_settings")
      .select("announcement")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_ANNOUNCEMENT;
    return mergeAnnouncement(data.announcement);
  } catch {
    return DEFAULT_ANNOUNCEMENT;
  }
});
