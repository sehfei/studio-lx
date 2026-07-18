"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNavItems } from "@/lib/admin-nav";
import type { AdminDictionary } from "@/lib/i18n/admin";
import type { Locale } from "@/lib/i18n/config";
import { signOut } from "@/app/admin/login/actions";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import {
  MenuIcon,
  CloseIcon,
  AccountIcon,
  HomeIcon,
  LogoutIcon,
} from "@/components/ui/NavIcons";

export function AdminSidebar({
  dict,
  visibleKeys,
  email,
  locale,
}: {
  dict: AdminDictionary["sidebar"];
  visibleKeys: string[];
  email: string;
  locale: Locale;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = adminNavItems.filter((item) => visibleKeys.includes(item.key));
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-full shrink-0 border-b border-border-subtle lg:w-56 lg:border-r lg:border-b-0 lg:p-4">
      {/* 手机：顶部只有标题 + 汉堡按钮，分类列表收进下拉抽屉 */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="-m-2 p-2 hover:text-icon"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={dict.title}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
          <p className="font-display text-lg tracking-widest uppercase">
            {dict.title}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="-m-2 p-2 text-foreground/60"
            title={email}
            aria-label={email}
          >
            <AccountIcon className="h-4 w-4" />
          </span>
          <Link
            href="/"
            className="-m-2 p-2 hover:text-icon"
            aria-label={dict.backToSite}
            title={dict.backToSite}
          >
            <HomeIcon className="h-4 w-4" />
          </Link>
          <AdminLanguageSwitcher current={locale} compact />
          <form action={signOut}>
            <button
              type="submit"
              className="-m-2 p-2 hover:text-icon"
              aria-label={dict.signOut}
              title={dict.signOut}
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-subtle px-4 pb-4 lg:hidden">
          <ul className="space-y-1 pt-3 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded px-3 py-3 ${
                    isActive(item.href)
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {dict.nav[item.key] ?? item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 桌面：竖排侧栏，恒定展开 */}
      <div className="hidden lg:block">
        <p className="px-2 font-display text-lg tracking-widest uppercase">
          {dict.title}
        </p>
        <nav className="mt-6">
          <ul className="space-y-1 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded px-3 py-2 whitespace-nowrap ${
                    isActive(item.href)
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {dict.nav[item.key] ?? item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
