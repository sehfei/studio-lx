import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByGenderCategory } from "@/lib/products";
import { genderCategories } from "@/lib/site-config";

type Params = { gender: string; category: string };

function resolve(gender: string, category: string) {
  const genderEntry = genderCategories.find((c) => c.slug === gender);
  const categoryEntry = genderEntry?.children.find((c) => c.slug === category);
  return { genderEntry, categoryEntry };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gender, category } = await params;
  const { genderEntry, categoryEntry } = resolve(gender, category);
  if (!genderEntry || !categoryEntry) return { title: "Not Found" };
  return { title: `${genderEntry.label} ${categoryEntry.label}` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gender, category } = await params;
  const { genderEntry, categoryEntry } = resolve(gender, category);
  if (!genderEntry || !categoryEntry) notFound();

  const products = await getProductsByGenderCategory(
    gender as "women" | "men",
    category as "clothing" | "shoes" | "bags" | "glasses" | "accessories",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">
        {genderEntry.label} / {categoryEntry.label}
      </h1>
      <ProductGrid products={products} />
    </div>
  );
}
