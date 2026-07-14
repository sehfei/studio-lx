export const siteConfig = {
  name: "STUDIO LX",
  tagline: "Contemporary Fashion, Curated",
  description:
    "STUDIO LX — 高端时尚精品店，甄选男女服饰、鞋履、包袋、眼镜与配饰。",
  url: "https://www.studiolx.example.com",
};

// 性别现在也跟分类一样是后台可管理的，见 src/lib/genders.ts 的 getGenders()。
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
