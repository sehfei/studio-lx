import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "My Account" };

const links = [
  { label: "Order History", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Address Book", href: "#" },
  { label: "Account Settings", href: "#" },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">My Account</h1>
      <p className="mb-8 text-sm text-foreground/50">
        会员系统开发中，登录后可在此管理订单与个人信息。
      </p>
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
