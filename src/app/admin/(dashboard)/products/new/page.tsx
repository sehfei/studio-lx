import { ProductForm } from "../ProductForm";
import { getCategories } from "@/lib/categories";
import { getGenders } from "@/lib/genders";
import { requirePermission } from "@/lib/auth";

export default async function NewProductPage() {
  await requirePermission("products");
  const [categories, genders] = await Promise.all([
    getCategories(),
    getGenders(),
  ]);
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Add Product</h1>
      <ProductForm categories={categories} genders={genders} />
    </div>
  );
}
