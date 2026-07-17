import { requirePermission } from "@/lib/auth";
import { BlogForm } from "../BlogForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export default async function NewPostPage() {
  await requirePermission("blog");
  const { t } = await getAdminI18n();
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">
        {t.pages.blog.newPageTitle}
      </h1>
      <BlogForm dict={t.pages.blog} common={t.common} />
    </div>
  );
}
