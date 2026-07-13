import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

// site_settings 是单行表（id=1），theme/announcement/identity/shipping/payment 都存在这一行里。
// 用 React cache() 包一层，同一次请求里 getTheme()/getAnnouncement()/getIdentity()
// 都调用它时只会真正查一次数据库。
export const fetchSiteSettingsRow = cache(async () => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("theme, announcement, identity, pages, shipping, payment")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return null;
  return data as {
    theme: unknown;
    announcement: unknown;
    identity: unknown;
    pages: unknown;
    shipping: unknown;
    payment: unknown;
  };
});
