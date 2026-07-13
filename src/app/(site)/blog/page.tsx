import type { Metadata } from "next";
import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ProductImage } from "@/components/ui/ProductImage";
import { getPublishedPosts } from "@/lib/blog";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const [posts, { t }] = await Promise.all([getPublishedPosts(), getI18n()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-10">{t.categories.blog}</h1>
      {posts.length === 0 ? (
        <p className="text-sm text-foreground/50">{t.blog.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              {post.coverImage ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <ProductImage src={post.coverImage} label={post.title} />
                </div>
              ) : (
                <PlaceholderImage
                  label={post.title}
                  className="aspect-[4/3] group-hover:opacity-80"
                />
              )}
              <p className="mt-3 text-xs text-foreground/40">
                {new Date(post.createdAt).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <h2 className="mt-1 text-sm font-medium group-hover:text-gold">
                {post.title}
              </h2>
              <p className="mt-1 text-sm text-foreground/60">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
