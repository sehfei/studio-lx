import type { Metadata } from "next";
import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { placeholderPosts } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-10">Blog</h1>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <PlaceholderImage
              label={post.title}
              className="aspect-[4/3] group-hover:opacity-80"
            />
            <p className="mt-3 text-xs text-foreground/40">{post.date}</p>
            <h2 className="mt-1 text-sm font-medium group-hover:text-gold">
              {post.title}
            </h2>
            <p className="mt-1 text-sm text-foreground/60">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
