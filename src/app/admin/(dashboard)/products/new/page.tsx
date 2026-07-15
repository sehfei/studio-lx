import { ProductForm } from "../ProductForm";
import { getCategories } from "@/lib/categories";
import { getGenders } from "@/lib/genders";
import { getSubcategories } from "@/lib/subcategories";
import { requirePermission } from "@/lib/auth";

export default async function NewProductPage() {
  await requirePermission("products");
  const [categories, genders, subcategories] = await Promise.all([
    getCategories(),
    getGenders(),
    getSubcategories(),
  ]);
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Add Product</h1>
      <ProductForm
        categories={categories}
        genders={genders}
        subcategories={subcategories}
      />
    </div>
  );
}
