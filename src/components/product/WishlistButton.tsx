"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/(site)/wishlist/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function WishlistButton({
  productId,
  initialInWishlist,
  t,
}: {
  productId: string;
  initialInWishlist: boolean;
  t: Dictionary;
}) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleWishlist(productId);
            if (result.requiresLogin) {
              router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
              return;
            }
            if (result.error) {
              setError(result.error);
              return;
            }
            if (typeof result.inWishlist === "boolean") {
              setInWishlist(result.inWishlist);
            }
          });
        }}
        aria-pressed={inWishlist}
        className={`inline-flex items-center gap-2 border px-4 py-2 text-sm transition-colors ${
          inWishlist
            ? "border-gold text-gold"
            : "border-border-subtle text-foreground/60 hover:border-gold hover:text-gold"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill={inWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 21s-7.5-4.7-10-9.3C0.3 8.1 2 4.5 5.6 4c2-.3 3.9.7 4.9 2.3.9-1.6 2.9-2.6 4.9-2.3 3.6.5 5.3 4.1 3.6 7.7C19.5 16.3 12 21 12 21z" />
        </svg>
        {inWishlist ? t.product.inWishlist : t.product.addToWishlist}
      </button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
