"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/admin-nav";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function AdminSidebar({
  dict,
  visibleKeys,
}: {
  dict: AdminDictionary["sidebar"];
  visibleKeys: string[];
}) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-border-subtle p-4 lg:w-56 lg:border-r lg:border-b-0">
      <p className="px-2 font-display text-lg tracking-widest uppercase lg:mb-6">
        {dict.title}
      </p>
      <nav className="mt-3 lg:mt-0">
        {/* 手机：横向滑动的导航条；桌面：竖排侧栏 */}
        <ul className="flex gap-1 overflow-x-auto pb-1 text-sm lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {adminNavItems
            .filter((item) => visibleKeys.includes(item.key))
            .map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`block rounded px-3 py-2 whitespace-nowrap ${
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {dict.nav[item.key] ?? item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
