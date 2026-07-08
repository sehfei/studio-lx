import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { getPostBySlug } from "@/lib/blog";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <p className="mb-2 text-xs text-foreground/40">{post.date}</p>
      <h1 className="section-title mb-8">{post.title}</h1>
      <PlaceholderImage label={post.title} className="mb-8 aspect-[16/9]" />
      <p className="text-sm leading-relaxed text-foreground/70">
        {post.content}
      </p>
    </article>
  );
}
