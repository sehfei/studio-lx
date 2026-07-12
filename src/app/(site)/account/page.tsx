import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const { t } = await getI18n();
  const links = [
    { label: t.account.orderHistory, href: "/orders" },
    { label: t.account.wishlist, href: "/wishlist" },
    { label: t.account.addressBook, href: "#" },
    { label: t.account.settings, href: "#" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.account.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{t.account.comingSoon}</p>
      <ul className="divide-y divide-border-subtle border-t border-b border-border-subtle">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex items-center justify-between py-4 text-sm hover:text-gold"
            >
              {link.label}
              <span>›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
