import { fetchSiteSettingsRow } from "@/lib/site-settings";

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

export async function getIdentity(): Promise<SiteIdentity> {
  try {
    const row = await fetchSiteSettingsRow();
    if (!row) return DEFAULT_IDENTITY;
    return mergeIdentity(row.identity);
  } catch {
    return DEFAULT_IDENTITY;
  }
}
