import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-sm sm:grid-cols-4 sm:px-8">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg tracking-widest uppercase">
            {siteConfig.name}
          </p>
          <p className="mt-2 text-foreground/60">{siteConfig.tagline}</p>
        </div>

        <div>
          <p className="eyebrow mb-3">品牌</p>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">客户服务</p>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/orders">Order Tracking</Link>
            </li>
            <li>
              <Link href="/account">My Account</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">订阅</p>
          <p className="text-foreground/60">
            订阅获取新品与限定优惠（功能开发中）
          </p>
        </div>
      </div>

      <div className="border-t border-border-subtle px-4 py-4 text-center text-xs text-foreground/40 sm:px-8">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
