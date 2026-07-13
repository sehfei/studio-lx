import { supabase } from "@/lib/supabase/client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  createdAt: string;
};

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
};

export function mapBlogRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    coverImage: row.cover_image ?? undefined,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

// 前台：只显示已发布的文章，按时间倒序
export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map(mapBlogRow);
  } catch {
    return [];
  }
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error || !data) return undefined;
    return mapBlogRow(data);
  } catch {
    return undefined;
  }
}
