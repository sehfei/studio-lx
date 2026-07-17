import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { BannerCarousel } from "@/components/ui/BannerCarousel";
import { getProductsByTag } from "@/lib/products";
import { getGenders } from "@/lib/genders";
import { getIdentity } from "@/lib/identity";
import { getActiveBanners } from "@/lib/banners";
import { getI18n } from "@/lib/i18n/dictionaries";
import { categoryLabel } from "@/lib/i18n/nav-labels";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [newArrivals, bestSellers, promotions, identity, banners, { t }, genders] =
    await Promise.all([
      getProductsByTag("new-arrival"),
      getProductsByTag("best-seller"),
      getProductsByTag("promotion"),
      getIdentity(),
      getActiveBanners(),
      getI18n(),
      getGenders(),
    ]);
  const hasHeroImage = Boolean(identity.heroImageUrl);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8">
        <div
          className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border border-border-subtle bg-foreground/3 sm:aspect-[16/7]"
          style={{ borderRadius: "var(--radius)" }}
        >
          {identity.heroImageUrl && (
            <>
              <Image
                src={identity.heroImageUrl}
                alt=""
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40" />
            </>
          )}
          <div className="relative px-4 text-center">
            <p className={`eyebrow mb-5 ${hasHeroImage ? "text-background/80" : ""}`}>
              {t.home.heroEyebrow}
            </p>
            <h1
              className={`section-title mb-7 text-4xl sm:text-6xl ${hasHeroImage ? "text-background" : ""}`}
            >
              {t.home.heroTitle}
            </h1>
            <Link href="/new-arrival" className="btn-primary">
              {t.home.shopNewArrival}
            </Link>
          </div>
        </div>
      </section>

      <BannerCarousel banners={banners} t={t} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {genders.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group relative block overflow-hidden"
              style={{ borderRadius: "var(--radius)" }}
            >
              <PlaceholderImage
                className="aspect-[4/3] transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
              <p className="absolute inset-x-0 bottom-6 text-center font-display text-2xl tracking-widest text-background uppercase transition-colors duration-300 group-hover:text-gold">
                {categoryLabel(t, cat.slug, cat.label)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">{t.categories.newArrival}</h2>
          <Link href="/new-arrival" className="text-sm hover:text-gold">
            {t.common.viewAll}
          </Link>
        </div>
        <ProductGrid
          products={newArrivals}
          emptyText={t.home.emptyProducts}
          outOfStockText={t.product.outOfStock}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">{t.categories.bestSeller}</h2>
          <Link href="/best-seller" className="text-sm hover:text-gold">
            {t.common.viewAll}
          </Link>
        </div>
        <ProductGrid
          products={bestSellers}
          emptyText={t.home.emptyProducts}
          outOfStockText={t.product.outOfStock}
        />
      </section>

      <section className="bg-foreground py-16 text-background">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-8">
          <p className="eyebrow mb-4 text-background/60">{t.home.limitedTime}</p>
          <h2 className="section-title mb-6">{t.categories.promotion}</h2>
          <Link href="/promotion" className="btn-outline border-background text-background hover:border-gold hover:text-gold">
            {t.home.shopPromotion}
          </Link>
        </div>
        <div className="mx-auto mt-12 max-w-7xl bg-background px-4 py-10 sm:px-8">
          <ProductGrid
            products={promotions}
            emptyText={t.home.emptyProducts}
            outOfStockText={t.product.outOfStock}
          />
        </div>
      </section>
    </div>
  );
}
