"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/admin-nav";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border-subtle p-4">
      <p className="mb-6 px-2 font-display text-lg tracking-widest uppercase">
        Admin
      </p>
      <nav>
        <ul className="space-y-1 text-sm">
          {adminNavItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded px-3 py-2 ${
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Link
        href="/"
        className="mt-6 block px-3 text-xs text-foreground/40 hover:text-gold"
      >
        ← 返回前台网站
      </Link>
    </aside>
  );
}
