"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon, MinusIcon } from "@/components/ui/NavIcons";
import { fetchNavProducts } from "@/lib/nav-actions";
import type { NavProduct } from "@/lib/products";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// 导航菜单手风琴节点：分类层（hasChildren=true）展开显示子分类节点（children），
// 子分类/无子分类的分类层（hasChildren=false）展开时懒加载该分类下的商品列表。
export function NavAccordion({
  labelText,
  href,
  gender,
  category,
  subcategory,
  hasChildren,
  children,
  t,
  onNavigate,
}: {
  labelText: string;
  href: string;
  gender: string;
  category: string;
  subcategory?: string;
  hasChildren: boolean;
  children?: React.ReactNode;
  t: Dictionary;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<NavProduct[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !hasChildren && products === null) {
      setLoading(true);
      const result = await fetchNavProducts(gender, category, subcategory);
      setProducts(result);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={href}
          onClick={onNavigate}
          className="block flex-1 py-2 text-left normal-case tracking-normal hover:text-gold"
        >
          {labelText}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={(open ? t.nav.collapse : t.nav.expand).replace(
            "{name}",
            labelText,
          )}
          className="-m-2 shrink-0 p-2 hover:text-icon"
        >
          {open ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      {open && (
        <div className="pl-4">
          {hasChildren ? (
            children
          ) : loading ? (
            <p className="py-1.5 text-xs text-foreground/40">
              {t.common.loading}
            </p>
          ) : products && products.length > 0 ? (
            <ul>
              {products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={onNavigate}
                    className="block py-1.5 text-xs text-foreground/70 hover:text-gold"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : products && products.length === 0 ? (
            <p className="py-1.5 text-xs text-foreground/40">
              {t.nav.noProductsYet}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
