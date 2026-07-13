import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByGenderCategory } from "@/lib/products";
import { genderCategories } from "@/lib/site-config";
import { getCategories } from "@/lib/categories";
import { getI18n } from "@/lib/i18n/dictionaries";
import { categoryLabel } from "@/lib/i18n/nav-labels";

type Params = { gender: string; category: string };

async function resolve(gender: string, category: string) {
  const genderEntry = genderCategories.find((c) => c.slug === gender);
  const categories = await getCategories();
  const categoryEntry = categories.find((c) => c.slug === category);
  return { genderEntry, categoryEntry };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gender, category } = await params;
  const { genderEntry, categoryEntry } = await resolve(gender, category);
  if (!genderEntry || !categoryEntry) return { title: "Not Found" };
  return { title: `${genderEntry.label} ${categoryEntry.label}` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gender, category } = await params;
  const { genderEntry, categoryEntry } = await resolve(gender, category);
  if (!genderEntry || !categoryEntry) notFound();

  const [products, { t }] = await Promise.all([
    getProductsByGenderCategory(gender as "women" | "men", category),
    getI18n(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">
        {categoryLabel(t, genderEntry.slug, genderEntry.label)} /{" "}
        {categoryLabel(t, categoryEntry.slug, categoryEntry.label)}
      </h1>
      <ProductGrid
        products={products}
        emptyText={t.home.emptyProducts}
        outOfStockText={t.product.outOfStock}
      />
    </div>
  );
}
