import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mapBlogRow, type BlogPostRow } from "@/lib/blog";
import { BlogForm } from "../../BlogForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("blog");
  const { t } = await getAdminI18n();
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const post = mapBlogRow(data as BlogPostRow);

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">
        {t.pages.blog.editPageTitle}
      </h1>
      <BlogForm post={post} dict={t.pages.blog} common={t.common} />
    </div>
  );
}
