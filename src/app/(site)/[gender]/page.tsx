import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByGender } from "@/lib/products";
import { getGenders } from "@/lib/genders";
import { getCategories } from "@/lib/categories";
import { getI18n } from "@/lib/i18n/dictionaries";
import { categoryLabel } from "@/lib/i18n/nav-labels";

type Params = { gender: string };

async function getGenderEntry(gender: string) {
  const genders = await getGenders();
  return genders.find((g) => g.slug === gender);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gender } = await params;
  const genderEntry = await getGenderEntry(gender);
  if (!genderEntry) return { title: "Not Found" };
  return {
    title: genderEntry.label,
    alternates: { canonical: `/${gender}` },
  };
}

export default async function GenderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gender } = await params;
  const genderEntry = await getGenderEntry(gender);
  if (!genderEntry) notFound();

  const [products, categories, { t }] = await Promise.all([
    getProductsByGender(gender),
    getCategories(),
    getI18n(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-6">
        {categoryLabel(t, genderEntry.slug, genderEntry.label)}
      </h1>
      <div className="mb-10 flex flex-wrap gap-3 text-xs tracking-widest uppercase">
        {categories.map((child) => (
          <Link
            key={child.slug}
            href={`/${gender}/${child.slug}`}
            className="border border-border-subtle px-4 py-2 hover:border-gold hover:text-gold"
            style={{ borderRadius: "var(--radius)" }}
          >
            {categoryLabel(t, child.slug, child.label)}
          </Link>
        ))}
      </div>
      <ProductGrid
        products={products}
        emptyText={t.home.emptyProducts}
        outOfStockText={t.product.outOfStock}
      />
    </div>
  );
}
