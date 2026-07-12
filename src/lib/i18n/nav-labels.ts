import type { Dictionary } from "./dictionaries";

// 商品分类 slug 映射到词典 categories 键，前后台导航/分类页共用。
export const CATEGORY_KEY: Record<string, keyof Dictionary["categories"]> = {
  women: "women",
  men: "men",
  clothing: "clothing",
  shoes: "shoes",
  bags: "bags",
  glasses: "glasses",
  accessories: "accessories",
  "new-arrival": "newArrival",
  "best-seller": "bestSeller",
  promotion: "promotion",
  about: "aboutUs",
  blog: "blog",
  contact: "contact",
  faq: "faq",
};

export function categoryLabel(
  t: Dictionary,
  slug: string,
  fallback: string,
): string {
  const key = CATEGORY_KEY[slug];
  return key ? t.categories[key] : fallback;
}
