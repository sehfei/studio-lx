"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/ui/ProductImage";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // 鼠标悬停大图时的相对位置（百分比），用来做跟随鼠标的放大镜效果
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  function showPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }
  function showNext(e: React.MouseEvent) {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  }

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

  // 关闭大图时把缩略图选中态同步到浏览到的那一张，而不是弹窗前的那张
  function closeLightbox() {
    if (openIndex !== null) setActiveIndex(openIndex);
    setOpenIndex(null);
  }

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="mx-auto w-full max-w-md">
        <div className="relative">
          {badge && <ProductBadge text={badge.text} variant={badge.variant} />}
          <div className={outOfStock ? "opacity-60 grayscale" : ""}>
            {images[activeIndex]?.url ? (
              <button
                type="button"
                onClick={() => setOpenIndex(activeIndex)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setZoomPos({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onMouseLeave={() => setZoomPos(null)}
                className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden"
                style={{ borderRadius: "var(--radius)" }}
                aria-label={t.product.viewImage.replace(
                  "{n}",
                  String(activeIndex + 1),
                )}
              >
                <Image
                  src={images[activeIndex].url}
                  alt={images[activeIndex].alt || productName}
                  fill
                  className="object-cover transition-transform duration-200 ease-out"
                  style={
                    zoomPos
                      ? {
                          transform: "scale(2)",
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }
                      : undefined
                  }
                  sizes="(max-width: 1024px) 90vw, 448px"
                />
              </button>
            ) : (
              <PlaceholderImage label={productName} />
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label={t.product.previousImage}
                  className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground/80 hover:text-gold"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label={t.product.nextImage}
                  className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground/80 hover:text-gold"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={img.url || i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-current={i === activeIndex}
                aria-label={t.product.viewImage.replace("{n}", String(i + 1))}
                className="block cursor-pointer"
              >
                <ProductImage
                  src={img.url}
                  alt={img.alt}
                  label={productName}
                  className={
                    i === activeIndex
                      ? "outline outline-2 outline-offset-2 outline-gold"
                      : "opacity-70 hover:opacity-100"
                  }
                />
              </button>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  i === activeIndex ? "bg-gold" : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
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
