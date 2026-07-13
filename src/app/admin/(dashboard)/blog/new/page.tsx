import { requirePermission } from "@/lib/auth";
import { BlogForm } from "../BlogForm";

export default async function NewPostPage() {
  await requirePermission("blog");
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Add Post</h1>
      <BlogForm />
    </div>
  );
}
