import type { MetadataRoute } from "next";
import { siteConfig, genderCategories } from "@/lib/site-config";
import { placeholderProducts } from "@/lib/products";
import { placeholderPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "about",
    "contact",
    "faq",
    "blog",
    "new-arrival",
    "best-seller",
    "promotion",
  ].map((route) => ({
    url: `${siteConfig.url}/${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const categoryRoutes = genderCategories.flatMap((cat) => [
    { url: `${siteConfig.url}/${cat.slug}`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...cat.children.map((child) => ({
      url: `${siteConfig.url}/${cat.slug}/${child.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const productRoutes = placeholderProducts.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const blogRoutes = placeholderPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
