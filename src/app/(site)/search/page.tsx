"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { placeholderProducts } from "@/lib/products";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return placeholderProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-8">Search</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索商品、品牌..."
        className="mb-10 w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
      />

      {query.trim() === "" ? (
        <p className="text-sm text-foreground/50">输入关键词开始搜索。</p>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
}
