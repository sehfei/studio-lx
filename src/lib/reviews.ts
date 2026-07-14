import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

// 商品评价：公开可读，走匿名 client（跟 categories.ts/genders.ts 同样的模式）。
// 写入走 src/app/(site)/product/[slug]/actions.ts 的 Server Action，
// 要求验证购买，见 src/lib/verified-purchase.ts。
export type ReviewRow = {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
};

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    authorName: row.author_name,
    createdAt: row.created_at,
  };
}

export const getProductReviews = cache(
  async (productId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map(mapReview);
  },
);

export function reviewAggregate(reviews: Review[]): {
  average: number;
  count: number;
} {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
