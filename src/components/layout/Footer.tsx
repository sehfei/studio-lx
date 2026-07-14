import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { SiteIdentity } from "@/lib/identity";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Footer({
  identity,
  t,
}: {
  identity: SiteIdentity;
  t: Dictionary;
}) {
  const socialLinks = [
    { label: "Instagram", href: identity.instagramUrl },
    { label: "Facebook", href: identity.facebookUrl },
    { label: "TikTok", href: identity.tiktokUrl },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-sm sm:grid-cols-4 sm:px-8">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg tracking-widest uppercase">
            {siteConfig.name}
          </p>
          <p className="mt-2 text-foreground/60">{siteConfig.tagline}</p>
          {socialLinks.length > 0 && (
            <ul className="mt-4 flex gap-4 text-xs tracking-widest text-foreground/60 uppercase">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3">{t.footer.brand}</p>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link href="/about">{t.categories.aboutUs}</Link>
            </li>
            <li>
              <Link href="/blog">{t.categories.blog}</Link>
            </li>
            <li>
              <Link href="/contact">{t.categories.contact}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">{t.footer.customerService}</p>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link href="/faq">{t.categories.faq}</Link>
            </li>
            <li>
              <Link href="/shipping-returns">{t.footer.shippingReturns}</Link>
            </li>
            <li>
              <Link href="/orders">{t.footer.orderTracking}</Link>
            </li>
            <li>
              <Link href="/account">{t.footer.myAccount}</Link>
            </li>
            <li>
              <Link href="/privacy">{t.footer.privacyPolicy}</Link>
            </li>
            <li>
              <Link href="/terms">{t.footer.termsOfService}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">{t.footer.subscribe}</p>
          <p className="text-foreground/60">{t.footer.subscribeHint}</p>
        </div>
      </div>

      <div className="border-t border-border-subtle px-4 py-4 text-center text-xs text-foreground/40 sm:px-8">
        © {new Date().getFullYear()} {siteConfig.name}. {t.footer.rights}
      </div>
    </footer>
  );
}
