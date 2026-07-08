import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-6">About Us</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        {siteConfig.name} 是一家专注东南亚市场的高端时尚精品店，甄选男女服饰、
        鞋履、包袋、眼镜与配饰，为顾客带来兼具设计感与品质的购物体验。
      </p>
      <p className="mt-4 text-sm leading-relaxed text-foreground/70">
        （品牌故事内容待补充）
      </p>
    </div>
  );
}
