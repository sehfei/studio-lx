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
import type { SubcategoryRow } from "@/lib/subcategories";
import { NavAccordion } from "./NavAccordion";
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
  subcategories,
}: {
  logoUrl?: string;
  locale: Locale;
  t: Dictionary;
  categories: CategoryRow[];
  genders: GenderRow[];
  subcategories: SubcategoryRow[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: cartCount } = useCart();
  const label = (slug: string, fallback: string) =>
    categoryLabel(t, slug, fallback);
  const subsByCategory = (category: string) =>
    subcategories.filter((s) => s.category === category);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <button
          className="-m-2 p-2 hover:text-icon lg:hidden"
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
            />
          ) : (
            "STUDIO.LX"
          )}
        </Link>

        <div className="flex items-center gap-3 text-xs tracking-widest uppercase sm:gap-5">
          <Link
            href="/search"
            aria-label={t.nav.search}
            className="-m-2 flex items-center gap-1.5 p-2 hover:text-icon"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.search}</span>
          </Link>
          <Link
            href="/wishlist"
            aria-label={t.nav.wishlist}
            className="-m-2 flex items-center gap-1.5 p-2 hover:text-icon"
          >
            <WishlistIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.wishlist}</span>
          </Link>
          <Link
            href="/cart"
            aria-label={t.nav.cart}
            className="-m-2 flex items-center gap-1.5 p-2 hover:text-icon"
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
            className="-m-2 hidden items-center gap-1.5 p-2 hover:text-icon sm:flex"
          >
            <AccountIcon className="h-4 w-4" />
            <span>{t.nav.account}</span>
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border-subtle sm:block"
          />
          <div className="hidden sm:block">
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      </div>

      <nav className="hidden border-t border-border-subtle lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-8 py-3 text-xs tracking-widest uppercase">
          {genders.map((cat) => (
            <li key={cat.slug} className="group relative">
              <Link href={`/${cat.slug}`} className="hover:text-gold">
                {label(cat.slug, cat.label)}
              </Link>
              <div
                className="absolute left-1/2 top-full hidden max-h-[70vh] w-56 -translate-x-1/2 overflow-y-auto border border-border-subtle bg-background px-5 py-2 shadow-lg group-hover:block"
                style={{ borderRadius: "var(--radius)" }}
              >
                {categories.map((child) => {
                  const subs = subsByCategory(child.slug);
                  return (
                    <NavAccordion
                      key={child.slug}
                      labelText={label(child.slug, child.label)}
                      href={`/${cat.slug}/${child.slug}`}
                      gender={cat.slug}
                      category={child.slug}
                      hasChildren={subs.length > 0}
                      t={t}
                    >
                      {subs.map((sub) => (
                        <NavAccordion
                          key={sub.slug}
                          labelText={sub.label}
                          href={`/${cat.slug}/${child.slug}/${sub.slug}`}
                          gender={cat.slug}
                          category={child.slug}
                          subcategory={sub.slug}
                          hasChildren={false}
                          t={t}
                        />
                      ))}
                    </NavAccordion>
                  );
                })}
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
                <div className="mt-1 pl-4">
                  {categories.map((child) => {
                    const subs = subsByCategory(child.slug);
                    return (
                      <NavAccordion
                        key={child.slug}
                        labelText={label(child.slug, child.label)}
                        href={`/${cat.slug}/${child.slug}`}
                        gender={cat.slug}
                        category={child.slug}
                        hasChildren={subs.length > 0}
                        t={t}
                        onNavigate={() => setMobileOpen(false)}
                      >
                        {subs.map((sub) => (
                          <NavAccordion
                            key={sub.slug}
                            labelText={sub.label}
                            href={`/${cat.slug}/${child.slug}/${sub.slug}`}
                            gender={cat.slug}
                            category={child.slug}
                            subcategory={sub.slug}
                            hasChildren={false}
                            t={t}
                            onNavigate={() => setMobileOpen(false)}
                          />
                        ))}
                      </NavAccordion>
                    );
                  })}
                </div>
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

          <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
            <Link
              href="/account"
              className="flex items-center gap-1.5"
              onClick={() => setMobileOpen(false)}
            >
              <AccountIcon className="h-4 w-4" />
              <span>{t.nav.account}</span>
            </Link>
            <LanguageSwitcher current={locale} />
          </div>
        </nav>
      )}
    </header>
  );
}
