import { ProductForm } from "../ProductForm";
import { getCategories } from "@/lib/categories";
import { requirePermission } from "@/lib/auth";

export default async function NewProductPage() {
  await requirePermission("products");
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
