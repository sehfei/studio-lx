"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  featureCollections,
  mainNavLinks,
  siteConfig,
} from "@/lib/site-config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/nav-labels";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "@/components/cart/CartContext";
import type { CategoryRow } from "@/lib/categories";
import type { GenderRow } from "@/lib/genders";
import {
  SearchIcon,
  CartIcon,
  AccountIcon,
  WishlistIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/ui/NavIcons";

export function Navbar({
  logoUrl,
  locale,
  t,
  categories,
  genders,
}: {
  logoUrl?: string;
  locale: Locale;
  t: Dictionary;
  categories: CategoryRow[];
  genders: GenderRow[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: cartCount } = useCart();
  const label = (slug: string, fallback: string) =>
    categoryLabel(t, slug, fallback);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <button
          className="-m-2 p-2 hover:text-gold lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? t.nav.close : t.nav.menu}
        >
          {mobileOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center font-display text-xl tracking-[0.15em] uppercase lg:static lg:left-auto lg:top-auto lg:translate-x-0 lg:translate-y-0"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteConfig.name}
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          ) : (
            "STUDIO.LX"
          )}
        </Link>

        <div className="flex items-center gap-5 text-xs tracking-widest uppercase">
          <Link
            href="/search"
            aria-label={t.nav.search}
            className="-m-2 flex items-center gap-1.5 p-2 hover:text-gold"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.search}</span>
          </Link>
          <Link
            href="/wishlist"
            aria-label={t.nav.wishlist}
            className="-m-2 hidden items-center gap-1.5 p-2 hover:text-gold sm:flex"
          >
            <WishlistIcon className="h-4 w-4" />
            <span>{t.nav.wishlist}</span>
          </Link>
          <Link
            href="/cart"
            aria-label={t.nav.cart}
            className="-m-2 flex items-center gap-1.5 p-2 hover:text-gold"
          >
            <span className="relative inline-flex">
              <CartIcon className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium normal-case text-background">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">{t.nav.cart}</span>
          </Link>
          <Link
            href="/account"
            aria-label={t.nav.account}
            className="-m-2 hidden items-center gap-1.5 p-2 hover:text-gold sm:flex"
          >
            <AccountIcon className="h-4 w-4" />
            <span>{t.nav.account}</span>
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-border-subtle" />
          <LanguageSwitcher current={locale} />
        </div>
      </div>

      <nav className="hidden border-t border-border-subtle lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-8 py-3 text-xs tracking-widest uppercase">
          {genders.map((cat) => (
            <li key={cat.slug} className="group relative">
              <Link href={`/${cat.slug}`} className="hover:text-gold">
                {label(cat.slug, cat.label)}
              </Link>
              <div className="absolute left-1/2 top-full hidden -translate-x-1/2 border border-border-subtle bg-background py-2 shadow-lg group-hover:block">
                {categories.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/${cat.slug}/${child.slug}`}
                    className="block min-w-[10rem] px-5 py-2 text-left normal-case tracking-normal hover:text-gold"
                  >
                    {label(child.slug, child.label)}
                  </Link>
                ))}
              </div>
            </li>
          ))}
          {featureCollections.map((item) => (
            <li key={item.slug}>
              <Link href={`/${item.slug}`} className="hover:text-gold">
                {label(item.slug, item.label)}
              </Link>
            </li>
          ))}
          {mainNavLinks.map((item) => (
            <li key={item.slug}>
              <Link href={`/${item.slug}`} className="hover:text-gold">
                {label(item.slug, item.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {mobileOpen && (
        <nav className="border-t border-border-subtle px-4 py-4 text-sm lg:hidden">
          <ul className="space-y-4">
            {genders.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="font-medium uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  {label(cat.slug, cat.label)}
                </Link>
                <ul className="mt-2 space-y-2 pl-4 text-foreground/70">
                  {categories.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/${cat.slug}/${child.slug}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {label(child.slug, child.label)}
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
                  {label(item.slug, item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
