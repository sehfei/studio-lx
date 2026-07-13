import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mapBlogRow, type BlogPostRow } from "@/lib/blog";
import { DeletePostButton } from "./DeletePostButton";

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

      {posts.length === 0 ? (
        <p className="text-sm text-foreground/50">还没有文章。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
                <th className="py-3">Title</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
                <th className="py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border-subtle">
                  <td className="py-3">{post.title}</td>
                  <td className="py-3">
                    {post.isPublished ? (
                      <span className="text-gold">已发布</span>
                    ) : (
                      <span className="text-foreground/40">草稿</span>
                    )}
                  </td>
                  <td className="py-3 text-foreground/60">
                    {new Date(post.createdAt).toLocaleDateString("en-MY")}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-xs text-foreground/60 hover:text-gold hover:underline"
                      >
                        编辑
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
