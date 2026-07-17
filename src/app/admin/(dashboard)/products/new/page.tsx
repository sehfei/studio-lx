import { ProductForm } from "../ProductForm";
import { getCategories } from "@/lib/categories";
import { getGenders } from "@/lib/genders";
import { getSubcategories } from "@/lib/subcategories";
import { requirePermission } from "@/lib/auth";
import { getAdminI18n } from "@/lib/i18n/admin";

export default async function NewProductPage() {
  await requirePermission("products");
  const { t } = await getAdminI18n();
  const [categories, genders, subcategories] = await Promise.all([
    getCategories(),
    getGenders(),
    getSubcategories(),
  ]);
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">
        {t.pages.products.newPageTitle}
      </h1>
      <ProductForm
        categories={categories}
        genders={genders}
        subcategories={subcategories}
        dict={t.pages.products}
        common={t.common}
      />
    </div>
  );
}
