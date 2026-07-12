"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getAllProducts, type Product } from "@/lib/products";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SearchClient({ t }: { t: Dictionary }) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query, allProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-8">{t.search.title}</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search.placeholder}
        className="input-theme mb-10"
      />

      {query.trim() === "" ? (
        <p className="text-sm text-foreground/50">{t.search.startPrompt}</p>
      ) : (
        <ProductGrid
          products={results}
          emptyText={t.search.noResults}
          outOfStockText={t.product.outOfStock}
        />
      )}
    </div>
  );
}
