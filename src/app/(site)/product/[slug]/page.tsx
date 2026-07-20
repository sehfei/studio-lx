import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { discountPercent, displayBadge, getProductBySlug } from "@/lib/products";
import { getI18n } from "@/lib/i18n/dictionaries";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ReviewForm, type ViewerState } from "@/components/product/ReviewForm";
import { getCustomer } from "@/lib/customer-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProductReviews, reviewAggregate } from "@/lib/reviews";
import { hasVerifiedPurchase } from "@/lib/verified-purchase";
import { siteConfig } from "@/lib/site-config";
import { safeJsonLd } from "@/lib/json-ld";

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
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      images: product.images[0]
        ? [{ url: product.images[0].url, alt: product.images[0].alt }]
        : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [product, { t }, customer] = await Promise.all([
    getProductBySlug(slug),
    getI18n(),
    getCustomer(),
  ]);
  if (!product) notFound();

  let initialInWishlist = false;
  let viewerState: ViewerState = "logged-out";
  if (customer) {
    const [{ data: wishlistRow }, verified, { data: ownReview }] =
      await Promise.all([
        supabaseAdmin
          .from("wishlist_items")
          .select("id")
          .eq("customer_id", customer.id)
          .eq("product_id", product.id)
          .maybeSingle(),
        hasVerifiedPurchase(customer.id, product.id),
        supabaseAdmin
          .from("product_reviews")
          .select("id")
          .eq("customer_id", customer.id)
          .eq("product_id", product.id)
          .maybeSingle(),
      ]);
    initialInWishlist = !!wishlistRow;
    viewerState = ownReview
      ? "already-reviewed"
      : verified
        ? "can-review"
        : "not-verified";
  }

  const reviews = await getProductReviews(product.id);
  const { average, count } = reviewAggregate(reviews);

  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;
  const badge = displayBadge(product, t.product.outOfStock);
  const outOfStock = product.stock <= 0;

  // schema.org Product 结构化数据，让 Google 搜索结果能显示价格/库存/评分
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/product/${slug}`,
      priceCurrency: "MYR",
      price: hasDiscount ? product.discountPrice : product.price,
      availability: outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    ...(count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          productName={product.name}
          badge={badge}
          outOfStock={outOfStock}
          t={t}
        />

        <div className="flex flex-col">
          <div className="order-1">
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
          </div>

          {/* 手机版把购买操作（颜色/尺码/加购/购买/心愿单）挪到简介前面，
              不用先滑过一长段文字描述才能下单；桌面版维持原来简介在前的顺序。*/}
          <p className="order-4 mb-8 text-sm text-foreground/70 lg:order-2">
            {product.description}
          </p>

          <div className="order-2 lg:order-3">
            <AddToCartForm product={product} t={t} />
          </div>

          <div className="order-3 mb-10 lg:order-4">
            <WishlistButton
              productId={product.id}
              initialInWishlist={initialInWishlist}
              t={t}
            />
          </div>

          <dl className="order-5 space-y-2 border-t border-border-subtle pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.material}</dt>
              <dd>{product.material}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.weight}</dt>
              <dd>{product.weight}</dd>
            </div>
            {product.stock > 0 && product.badgeText?.toLowerCase() !== "pre-order" && (
              <div className="flex justify-between">
                <dt className="text-foreground/50">{t.product.stock}</dt>
                <dd>
                  {product.stock} {t.product.stockUnit}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.product.shipping}</dt>
              <dd className="text-right">{product.shippingInfo}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-16 border-t border-border-subtle pt-10">
        <h2 className="section-title mb-2">{t.product.reviews}</h2>
        {count > 0 && (
          <p className="mb-6 text-sm text-foreground/60">
            {average.toFixed(1)} ★ ({count} {t.product.reviewCount})
          </p>
        )}
        {reviews.length === 0 ? (
          <p className="text-sm text-foreground/50">{t.product.noReviews}</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="border border-border-subtle p-4 text-sm"
                style={{ borderRadius: "var(--radius)" }}
              >
                <p className="mb-1 font-medium">
                  {review.authorName}
                  <span className="ml-2 text-gold">
                    {"★".repeat(review.rating)}
                    <span className="text-foreground/20">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </span>
                </p>
                <p className="text-foreground/70">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
        <ReviewForm
          productId={product.id}
          productSlug={slug}
          viewerState={viewerState}
          t={t}
        />
      </section>
    </div>
  );
}
