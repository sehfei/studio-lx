import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { getProductById } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getGenders } from "@/lib/genders";
import { getSubcategories } from "@/lib/subcategories";
import { ProductForm } from "../../ProductForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("products");
  const { t } = await getAdminI18n();
  const { id } = await params;
  const [product, categories, genders, subcategories] = await Promise.all([
    getProductById(id),
    getCategories(),
    getGenders(),
    getSubcategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">
        {t.pages.products.editPageTitle}
      </h1>
      <ProductForm
        product={product}
        categories={categories}
        genders={genders}
        subcategories={subcategories}
        dict={t.pages.products}
        common={t.common}
      />
    </div>
  );
}
