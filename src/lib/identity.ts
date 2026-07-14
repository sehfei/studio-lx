import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

export type SiteIdentity = {
  logoUrl?: string;
  faviconUrl?: string;
  heroImageUrl?: string;
  whatsappNumber: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  gaId?: string;
  metaPixelId?: string;
};

export const DEFAULT_IDENTITY: SiteIdentity = {
  whatsappNumber: "60000000000",
};

function mergeIdentity(partial: unknown): SiteIdentity {
  const p = (partial ?? {}) as Partial<SiteIdentity>;
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  return {
    logoUrl: str(p.logoUrl),
    faviconUrl: str(p.faviconUrl),
    heroImageUrl: str(p.heroImageUrl),
    whatsappNumber: str(p.whatsappNumber) ?? DEFAULT_IDENTITY.whatsappNumber,
    instagramUrl: str(p.instagramUrl),
    facebookUrl: str(p.facebookUrl),
    tiktokUrl: str(p.tiktokUrl),
    gaId: str(p.gaId),
    metaPixelId: str(p.metaPixelId),
  };
}

export const getIdentity = cache(async (): Promise<SiteIdentity> => {
  try {
    const { data, error } = await supabase
      .from("identity_settings")
      .select("identity")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_IDENTITY;
    return mergeIdentity(data.identity);
  } catch {
    return DEFAULT_IDENTITY;
  }
});
