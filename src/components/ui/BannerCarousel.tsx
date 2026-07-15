"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/banners";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  // 多张时每 5 秒自动切换
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const active = banners[index];
  const hasText = Boolean(active.title || active.subtitle);

  const inner = (
    <>
      <Image
        src={active.imageUrl}
        alt={active.title || ""}
        fill
        priority
        className="object-cover"
      />
      {hasText && <div className="absolute inset-0 bg-foreground/35" />}
      {hasText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          {active.subtitle && (
            <p className="eyebrow mb-3 text-background/80">{active.subtitle}</p>
          )}
          {active.title && (
            <h2 className="section-title mb-5 text-3xl text-background sm:text-5xl">
              {active.title}
            </h2>
          )}
          {active.linkUrl && active.linkText && (
            <span className="btn-primary">{active.linkText}</span>
          )}
        </div>
      )}
    </>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden border border-border-subtle sm:aspect-[16/6]"
        style={{ borderRadius: "var(--radius)" }}
      >
        {active.linkUrl ? (
          <Link href={active.linkUrl} className="block h-full w-full">
            {inner}
          </Link>
        ) : (
          inner
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`切换到第 ${i + 1} 张`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-background" : "bg-background/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
