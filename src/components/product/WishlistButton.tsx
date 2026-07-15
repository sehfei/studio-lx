"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/(site)/wishlist/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { WishlistIcon } from "@/components/ui/NavIcons";

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
        <WishlistIcon className="h-4 w-4" filled={inWishlist} />
        {inWishlist ? t.product.inWishlist : t.product.addToWishlist}
      </button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
