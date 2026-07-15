import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ProductImage } from "@/components/ui/ProductImage";
import { getPostBySlug } from "@/lib/blog";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <p className="mb-2 text-xs text-foreground/40">
        {new Date(post.createdAt).toLocaleDateString("en-MY", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      <h1 className="section-title mb-8">{post.title}</h1>
      {post.coverImage ? (
        <div className="mb-8 aspect-[16/9] overflow-hidden">
          <ProductImage src={post.coverImage} label={post.title} />
        </div>
      ) : (
        <PlaceholderImage label={post.title} className="mb-8 aspect-[16/9]" />
      )}
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/70">
        {post.content}
      </p>
    </article>
  );
}
