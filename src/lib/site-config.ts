export const siteConfig = {
  name: "STUDIO LX",
  tagline: "Contemporary Fashion, Curated",
  description:
    "STUDIO LX — 高端时尚精品店，甄选男女服饰、鞋履、包袋、眼镜与配饰。",
  url: "https://www.studiolx.example.com",
};

export type NavCategory = {
  label: string;
  slug: string;
};

// 性别是固定的两个顶层分区，不像分类那样后台可管理——
// 分类现在是动态的，见 src/lib/categories.ts 的 getCategories()。
export const genderCategories: NavCategory[] = [
  { label: "Women", slug: "women" },
  { label: "Men", slug: "men" },
];

export const featureCollections = [
  { label: "New Arrival", slug: "new-arrival" },
  { label: "Best Seller", slug: "best-seller" },
  { label: "Promotion", slug: "promotion" },
];

export const mainNavLinks = [
  { label: "About Us", slug: "about" },
  { label: "Blog", slug: "blog" },
  { label: "Contact", slug: "contact" },
  { label: "FAQ", slug: "faq" },
];
