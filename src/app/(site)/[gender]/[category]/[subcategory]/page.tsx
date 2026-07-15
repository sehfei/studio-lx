import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByGenderCategorySubcategory } from "@/lib/products";
import { getGenders } from "@/lib/genders";
import { getCategories } from "@/lib/categories";
import { getSubcategoriesByCategory } from "@/lib/subcategories";
import { getI18n } from "@/lib/i18n/dictionaries";
import { categoryLabel } from "@/lib/i18n/nav-labels";

type Params = { gender: string; category: string; subcategory: string };

async function resolve(gender: string, category: string, subcategory: string) {
  const [genders, categories, subcategories] = await Promise.all([
    getGenders(),
    getCategories(),
    getSubcategoriesByCategory(category),
  ]);
  const genderEntry = genders.find((g) => g.slug === gender);
  const categoryEntry = categories.find((c) => c.slug === category);
  const subcategoryEntry = subcategories.find((s) => s.slug === subcategory);
  return { genderEntry, categoryEntry, subcategoryEntry };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gender, category, subcategory } = await params;
  const { genderEntry, categoryEntry, subcategoryEntry } = await resolve(
    gender,
    category,
    subcategory,
  );
  if (!genderEntry || !categoryEntry || !subcategoryEntry) {
    return { title: "Not Found" };
  }
  return {
    title: `${genderEntry.label} ${categoryEntry.label} ${subcategoryEntry.label}`,
    alternates: { canonical: `/${gender}/${category}/${subcategory}` },
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gender, category, subcategory } = await params;
  const { genderEntry, categoryEntry, subcategoryEntry } = await resolve(
    gender,
    category,
    subcategory,
  );
  if (!genderEntry || !categoryEntry || !subcategoryEntry) notFound();

  const [products, { t }] = await Promise.all([
    getProductsByGenderCategorySubcategory(gender, category, subcategory),
    getI18n(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">
        {categoryLabel(t, genderEntry.slug, genderEntry.label)} /{" "}
        {categoryLabel(t, categoryEntry.slug, categoryEntry.label)} /{" "}
        {subcategoryEntry.label}
      </h1>
      <ProductGrid
        products={products}
        emptyText={t.home.emptyProducts}
        outOfStockText={t.product.outOfStock}
      />
    </div>
  );
}
