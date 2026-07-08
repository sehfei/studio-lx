import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductImage } from "@/components/ui/ProductImage";
import { getProductBySlug } from "@/lib/products";

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
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <ProductImage
            src={product.images[0]}
            label={product.name}
            className="col-span-2"
          />
          <ProductImage src={product.images[1]} label={`${product.name} 细节图 1`} />
          <ProductImage src={product.images[2]} label={`${product.name} 细节图 2`} />
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
              </>
            ) : (
              <span>RM {product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="mb-8 text-sm text-foreground/70">
            {product.description}
          </p>

          <div className="mb-6">
            <p className="eyebrow mb-2">Color</p>
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
            <p className="eyebrow mb-2">Size</p>
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
              Add to Cart
            </button>
            <button className="btn-outline flex-1" disabled>
              Buy Now
            </button>
          </div>
          <p className="mb-10 text-xs text-foreground/40">
            购物车与结账功能开发中，敬请期待。
          </p>

          <dl className="space-y-2 border-t border-border-subtle pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/50">Material</dt>
              <dd>{product.material}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">Weight</dt>
              <dd>{product.weight}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">Stock</dt>
              <dd>{product.stock} 件</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">Shipping</dt>
              <dd className="text-right">{product.shippingInfo}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-16 border-t border-border-subtle pt-10">
        <h2 className="section-title mb-6">Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-foreground/50">暂无评价。</p>
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
