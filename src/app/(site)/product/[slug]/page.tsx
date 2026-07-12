import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductBadge } from "@/components/ui/ProductBadge";
import { discountPercent, displayBadge, getProductBySlug } from "@/lib/products";
import { getI18n } from "@/lib/i18n/dictionaries";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not Found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [product, { t }] = await Promise.all([
    getProductBySlug(slug),
    getI18n(),
  ]);
  if (!product) notFound();

  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;
  const badge = displayBadge(product, t.product.outOfStock);
  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative col-span-2">
            {badge && <ProductBadge text={badge.text} variant={badge.variant} />}
            <div className={outOfStock ? "opacity-60 grayscale" : ""}>
              <ProductImage src={product.images[0]} label={product.name} />
            </div>
          </div>
          <ProductImage src={product.images[1]} label={product.name} />
          <ProductImage src={product.images[2]} label={product.name} />
        </div>

        <div>
          <p className="eyebrow mb-2">{product.brand}</p>
          <h1 className="section-title mb-4">{product.name}</h1>
          <p className="mb-1 text-xs text-foreground/40">SKU: {product.sku}</p>

          <div className="mb-6 flex items-center gap-3 text-lg">
            {hasDiscount ? (
              <>
                <span className="text-gold">
                  RM {product.discountPrice!.toFixed(2)}
                </span>
                <span className="text-foreground/40 line-through">
                  RM {product.price.toFixed(2)}
                </span>
                {discountPercent(product.price, product.discountPrice!) > 0 && (
                  <span
                    className="bg-gold px-2 py-0.5 text-sm font-medium text-background"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    -{discountPercent(product.price, product.discountPrice!)}%
                  </span>
                )}
              </>
            ) : (
              <span>RM {product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="mb-8 text-sm text-foreground/70">
            {product.description}
          </p>

          <div className="mb-6">
            <p className="eyebrow mb-2">{t.product.color}</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className="border border-border-subtle px-4 py-2 text-sm hover:border-gold hover:text-gold"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="eyebrow mb-2">{t.product.size}</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className="border border-border-subtle px-4 py-2 text-sm hover:border-gold hover:text-gold"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary flex-1" disabled>
              {t.product.addToCart}
            </button>
            <button className="btn-outline flex-1" disabled>
              {t.product.buyNow}
            </button>
          </div>
          <p className="mb-10 text-xs text-foreground/40">
            {t.product.cartComingSoon}
          </p>

          <dl className="space-y-2 border-t border-border-subtle pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.material}</dt>
              <dd>{product.material}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.weight}</dt>
              <dd>{product.weight}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.stock}</dt>
              <dd>
                {product.stock} {t.product.stockUnit}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.shipping}</dt>
              <dd className="text-right">{product.shippingInfo}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-16 border-t border-border-subtle pt-10">
        <h2 className="section-title mb-6">{t.product.reviews}</h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-foreground/50">{t.product.noReviews}</p>
        ) : (
          <ul className="space-y-4">
            {product.reviews.map((review, i) => (
              <li key={i} className="border border-border-subtle p-4 text-sm">
                <p className="mb-1 font-medium">{review.author}</p>
                <p className="text-foreground/70">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
