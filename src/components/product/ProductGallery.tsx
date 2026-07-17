"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductBadge } from "@/components/ui/ProductBadge";
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/NavIcons";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ProductImage as ProductImageType } from "@/lib/products";

export function ProductGallery({
  images,
  productName,
  badge,
  outOfStock,
  t,
}: {
  images: ProductImageType[];
  productName: string;
  badge?: { text: string; variant?: "default" | "stock" } | null;
  outOfStock: boolean;
  t: Dictionary;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      }
      if (e.key === "ArrowRight") {
        setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, images.length]);

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative col-span-2">
          {badge && <ProductBadge text={badge.text} variant={badge.variant} />}
          <div className={outOfStock ? "opacity-60 grayscale" : ""}>
            <button
              type="button"
              onClick={() => setOpenIndex(0)}
              className="block w-full cursor-zoom-in"
              aria-label={t.product.viewImage.replace("{n}", "1")}
            >
              <ProductImage
                src={images[0]?.url}
                alt={images[0]?.alt}
                label={productName}
              />
            </button>
          </div>
        </div>
        {images.slice(1).map((img, i) => (
          <button
            key={img.url || i}
            type="button"
            onClick={() => setOpenIndex(i + 1)}
            className="block cursor-zoom-in"
            aria-label={t.product.viewImage.replace("{n}", String(i + 2))}
          >
            <ProductImage src={img.url} alt={img.alt} label={productName} />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label={t.product.closeGallery}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-white/80 hover:text-white"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) =>
                    i === null ? i : (i - 1 + images.length) % images.length,
                  );
                }}
                aria-label={t.product.previousImage}
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white/80 hover:text-white sm:left-4"
              >
                <ChevronLeftIcon className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
                }}
                aria-label={t.product.nextImage}
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white/80 hover:text-white sm:right-4"
              >
                <ChevronRightIcon className="h-7 w-7" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-3xl px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {images.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60">
              {openIndex! + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
