import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByGender } from "@/lib/products";
import { genderCategories } from "@/lib/site-config";

type Params = { gender: string };

function getCategory(gender: string) {
  return genderCategories.find((c) => c.slug === gender);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gender } = await params;
  const category = getCategory(gender);
  return { title: category?.label ?? "Not Found" };
}

export default async function GenderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gender } = await params;
  const category = getCategory(gender);
  if (!category) notFound();

  const products = await getProductsByGender(gender as "women" | "men");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-6">{category.label}</h1>
      <div className="mb-10 flex flex-wrap gap-3 text-xs tracking-widest uppercase">
        {category.children.map((child) => (
          <Link
            key={child.slug}
            href={`/${gender}/${child.slug}`}
            className="border border-border-subtle px-4 py-2 hover:border-gold hover:text-gold"
          >
            {child.label}
          </Link>
        ))}
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
