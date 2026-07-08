import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByTag } from "@/lib/products";
import { genderCategories } from "@/lib/site-config";

export default async function Home() {
  const [newArrivals, bestSellers, promotions] = await Promise.all([
    getProductsByTag("new-arrival"),
    getProductsByTag("best-seller"),
    getProductsByTag("promotion"),
  ]);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8">
        <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden border border-border-subtle bg-[repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5_10px,#fafafa_10px,#fafafa_20px)]">
          <div className="text-center">
            <p className="eyebrow mb-4">Summer Collection</p>
            <h1 className="section-title mb-6 text-4xl sm:text-5xl">
              Cycle of Becoming
            </h1>
            <Link href="/new-arrival" className="btn-primary">
              Shop New Arrival
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {genderCategories.map((cat) => (
            <Link key={cat.slug} href={`/${cat.slug}`} className="group block">
              <PlaceholderImage
                label={cat.label}
                className="aspect-[4/3] group-hover:opacity-80"
              />
              <p className="mt-4 text-center text-sm tracking-widest uppercase group-hover:text-gold">
                Shop {cat.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">New Arrival</h2>
          <Link href="/new-arrival" className="text-sm hover:text-gold">
            View All
          </Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">Best Seller</h2>
          <Link href="/best-seller" className="text-sm hover:text-gold">
            View All
          </Link>
        </div>
        <ProductGrid products={bestSellers} />
      </section>

      <section className="bg-foreground py-16 text-background">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-8">
          <p className="eyebrow mb-4 text-background/60">Limited Time</p>
          <h2 className="section-title mb-6">Promotion</h2>
          <Link href="/promotion" className="btn-outline border-background text-background hover:border-gold hover:text-gold">
            Shop Promotion
          </Link>
        </div>
        <div className="mx-auto mt-12 max-w-7xl bg-background px-4 py-10 sm:px-8">
          <ProductGrid products={promotions} />
        </div>
      </section>
    </div>
  );
}
