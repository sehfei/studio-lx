"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { submitReview } from "@/app/(site)/product/[slug]/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type ViewerState =
  | "logged-out"
  | "not-verified"
  | "already-reviewed"
  | "can-review";

function Star({
  filled,
  onClick,
}: {
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-0.5"
      aria-label={filled ? "filled star" : "empty star"}
    >
      <svg
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        className={`h-6 w-6 ${filled ? "text-gold" : "text-foreground/30"}`}
      >
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9 2.6-5.3z" />
      </svg>
    </button>
  );
}

// 商品页嵌入的评价区块：已提交/已购买/未登录几种状态分别展示，
// 未登录不整页硬跳转（跟 WishlistButton 一样，只是把人带去登录页再带回来）。
export function ReviewForm({
  productId,
  productSlug,
  viewerState,
  t,
}: {
  productId: string;
  productSlug: string;
  viewerState: ViewerState;
  t: Dictionary;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  if (submitted) {
    return (
      <p className="mt-8 border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">
        {t.product.alreadyReviewed}
      </p>
    );
  }

  if (viewerState === "logged-out") {
    return (
      <p className="mt-8 text-sm text-foreground/50">
        <button
          type="button"
          className="text-gold hover:underline"
          onClick={() =>
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          }
        >
          {t.product.loginToReview}
        </button>
      </p>
    );
  }

  if (viewerState === "not-verified") {
    return (
      <p className="mt-8 text-sm text-foreground/50">
        {t.product.verifiedPurchaseRequired}
      </p>
    );
  }

  if (viewerState === "already-reviewed") {
    return (
      <p className="mt-8 text-sm text-foreground/50">
        {t.product.alreadyReviewed}
      </p>
    );
  }

  return (
    <div className="mt-8 max-w-md border border-border-subtle p-4">
      <p className="mb-3 text-sm font-medium">{t.product.writeReview}</p>
      <p className="mb-1 text-xs text-foreground/50">{t.product.ratingLabel}</p>
      <div className="mb-3 flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} filled={i <= rating} onClick={() => setRating(i)} />
        ))}
      </div>
      <label className="mb-1 block text-xs text-foreground/50">
        {t.product.commentLabel}
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="input-theme mb-3"
      />
      {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
      <button
        type="button"
        disabled={pending}
        className="btn-primary"
        onClick={() => {
          setError(null);
          if (rating < 1) {
            setError("请选择 1-5 星评分");
            return;
          }
          if (!comment.trim()) {
            setError("请填写评价内容");
            return;
          }
          const formData = new FormData();
          formData.set("rating", String(rating));
          formData.set("comment", comment);
          startTransition(async () => {
            const result = await submitReview(productId, productSlug, formData);
            if (result.requiresLogin) {
              router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
              return;
            }
            if (result.error) {
              setError(result.error);
              return;
            }
            setSubmitted(true);
          });
        }}
      >
        {pending ? t.product.submittingReview : t.product.submitReview}
      </button>
    </div>
  );
}
