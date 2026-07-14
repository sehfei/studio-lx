import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getCategories } from "@/lib/categories";
import { getGenders } from "@/lib/genders";
import { getAllProducts } from "@/lib/products";
import { getPublishedPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, genders] = await Promise.all([
    getCategories(),
    getGenders(),
  ]);
  const staticRoutes = [
    "",
    "about",
    "contact",
    "faq",
    "blog",
    "new-arrival",
    "best-seller",
    "promotion",
    "privacy",
    "terms",
  ].map((route) => ({
    url: `${siteConfig.url}/${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const categoryRoutes = genders.flatMap((cat) => [
    { url: `${siteConfig.url}/${cat.slug}`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...categories.map((child) => ({
      url: `${siteConfig.url}/${cat.slug}/${child.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const products = await getAllProducts();
  const productRoutes = products.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const posts = await getPublishedPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
