import { fetchSiteSettingsRow } from "@/lib/site-settings";
import type { Locale } from "@/lib/i18n/config";

// 可在后台编辑的内容页（关于我们、运费退换货）。每页存中英双语标题+正文，
// 前台按当前语言选，为空时回退到内置默认文案。存在 site_settings.pages。

export type PageContent = {
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
};

export type PageKey = "about" | "shipping";

export type SitePages = Record<PageKey, PageContent>;

const EMPTY: PageContent = { titleEn: "", titleZh: "", bodyEn: "", bodyZh: "" };

// 内置默认文案，后台没填时用这个，保证页面永远有内容
export const DEFAULT_PAGES: SitePages = {
  about: {
    titleEn: "About Us",
    titleZh: "关于我们",
    bodyEn:
      "STUDIO LX is a curated fashion boutique for Southeast Asia, offering designer apparel, shoes, bags, eyewear and accessories with an emphasis on quality and timeless design.",
    bodyZh:
      "STUDIO LX 是一家专注东南亚市场的高端时尚精品店，甄选男女服饰、鞋履、包袋、眼镜与配饰，为顾客带来兼具设计感与品质的购物体验。",
  },
  shipping: {
    titleEn: "Shipping & Returns",
    titleZh: "运费与退换货",
    bodyEn:
      "West Malaysia: 2–4 working days. East Malaysia: 4–7 working days.\n\nReturns and exchanges are accepted within 7 days of receipt for unworn items with tags attached. Please contact us to arrange a return.",
    bodyZh:
      "西马：2-4 工作日送达。东马：4-7 工作日送达。\n\n收到商品 7 天内，未穿着且吊牌完整的商品可申请退换。请联系客服安排退货。",
  },
};

function mergePages(partial: unknown): SitePages {
  const p = (partial ?? {}) as Partial<Record<PageKey, Partial<PageContent>>>;
  const one = (key: PageKey): PageContent => ({
    ...EMPTY,
    ...(p[key] ?? {}),
  });
  return { about: one("about"), shipping: one("shipping") };
}

export async function getPages(): Promise<SitePages> {
  try {
    const row = await fetchSiteSettingsRow();
    if (!row) return { about: { ...EMPTY }, shipping: { ...EMPTY } };
    return mergePages(row.pages);
  } catch {
    return { about: { ...EMPTY }, shipping: { ...EMPTY } };
  }
}

// 按当前语言取标题/正文，后台没填则回退默认文案
export function resolvePage(
  pages: SitePages,
  key: PageKey,
  locale: Locale,
): { title: string; body: string } {
  const stored = pages[key];
  const fallback = DEFAULT_PAGES[key];
  const pick = (en: string, zh: string, defEn: string, defZh: string) => {
    if (locale === "zh") return zh || defZh;
    return en || defEn;
  };
  return {
    title: pick(stored.titleEn, stored.titleZh, fallback.titleEn, fallback.titleZh),
    body: pick(stored.bodyEn, stored.bodyZh, fallback.bodyEn, fallback.bodyZh),
  };
}
