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
  children: { label: string; slug: string }[];
};

export const genderCategories: NavCategory[] = [
  {
    label: "Women",
    slug: "women",
    children: [
      { label: "Clothing", slug: "clothing" },
      { label: "Shoes", slug: "shoes" },
      { label: "Bags", slug: "bags" },
      { label: "Glasses", slug: "glasses" },
      { label: "Accessories", slug: "accessories" },
    ],
  },
  {
    label: "Men",
    slug: "men",
    children: [
      { label: "Clothing", slug: "clothing" },
      { label: "Shoes", slug: "shoes" },
      { label: "Bags", slug: "bags" },
      { label: "Glasses", slug: "glasses" },
      { label: "Accessories", slug: "accessories" },
    ],
  },
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
