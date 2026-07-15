import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mapBlogRow, type BlogPostRow } from "@/lib/blog";
import { DeletePostButton } from "./DeletePostButton";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requirePermission("blog");
  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts = ((data ?? []) as BlogPostRow[]).map(mapBlogRow);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium">Blog</h1>
        <Link href="/admin/blog/new" className="btn-primary">
          + Add Post
        </Link>
      </div>

      <AdminTable
        emptyText="还没有文章。"
        columns={[
          { key: "title", label: "Title" },
          { key: "status", label: "Status" },
          { key: "date", label: "Date", cellClassName: "text-foreground/60" },
          { key: "actions", label: "操作" },
        ]}
        rows={posts.map((post) => ({
          key: post.id,
          cells: {
            title: post.title,
            status: post.isPublished ? (
              <span className="text-gold">已发布</span>
            ) : (
              <span className="text-foreground/40">草稿</span>
            ),
            date: new Date(post.createdAt).toLocaleDateString("en-MY"),
            actions: (
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="text-xs text-foreground/60 hover:text-gold hover:underline"
                >
                  编辑
                </Link>
                <DeletePostButton id={post.id} title={post.title} />
              </div>
            ),
          },
        }))}
      />
    </div>
  );
}
