"use client";

import Link from "next/link";
import { useState } from "react";
import {
  featureCollections,
  genderCategories,
  mainNavLinks,
  siteConfig,
} from "@/lib/site-config";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <button
          className="text-sm lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="打开菜单"
        >
          {mobileOpen ? "关闭" : "菜单"}
        </button>

        <Link
          href="/"
          className="font-display text-xl tracking-[0.15em] uppercase"
        >
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/search" aria-label="搜索">
            搜索
          </Link>
          <Link href="/wishlist" aria-label="心愿单">
            心愿单
          </Link>
          <Link href="/cart" aria-label="购物车">
            购物车
          </Link>
          <Link href="/account" aria-label="我的账户" className="hidden sm:inline">
            账户
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-border-subtle lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-8 py-3 text-xs tracking-widest uppercase">
          {genderCategories.map((cat) => (
            <li key={cat.slug} className="group relative">
              <Link href={`/${cat.slug}`} className="hover:text-gold">
                {cat.label}
              </Link>
              <div className="absolute left-1/2 top-full hidden -translate-x-1/2 border border-border-subtle bg-background py-2 shadow-lg group-hover:block">
                {cat.children.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/${cat.slug}/${child.slug}`}
                    className="block min-w-[10rem] px-5 py-2 text-left normal-case tracking-normal hover:text-gold"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </li>
          ))}
          {featureCollections.map((item) => (
            <li key={item.slug}>
              <Link href={`/${item.slug}`} className="hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
          {mainNavLinks.map((item) => (
            <li key={item.slug}>
              <Link href={`/${item.slug}`} className="hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {mobileOpen && (
        <nav className="border-t border-border-subtle px-4 py-4 text-sm lg:hidden">
          <ul className="space-y-4">
            {genderCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="font-medium uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.label}
                </Link>
                <ul className="mt-2 space-y-2 pl-4 text-foreground/70">
                  {cat.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/${cat.slug}/${child.slug}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {[...featureCollections, ...mainNavLinks].map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
