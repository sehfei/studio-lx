import { ProductForm } from "../ProductForm";
import { getCategories } from "@/lib/categories";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
