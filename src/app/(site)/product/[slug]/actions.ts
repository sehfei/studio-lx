"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCustomer } from "@/lib/customer-auth";
import { hasVerifiedPurchase } from "@/lib/verified-purchase";
import { dbErrorMessage } from "@/lib/db-error";

export type SubmitReviewResult = {
  error?: string;
  success?: boolean;
  requiresLogin?: boolean;
};

// 跟 wishlist/actions.ts 的 toggleWishlist 一样：未登录不硬跳转，
// 返回 requiresLogin 让客户端组件自己决定怎么提示（表单嵌在商品页里，
// 不是独立页面，不适合用 requireCustomer() 那种整页硬跳转）。
export async function submitReview(
  productId: string,
  productSlug: string,
  formData: FormData,
): Promise<SubmitReviewResult> {
  const customer = await getCustomer();
  if (!customer) {
    return { requiresLogin: true };
  }

  // 服务端重新验证购买，不信任客户端已经算好的 viewerState
  const verified = await hasVerifiedPurchase(customer.id, productId);
  if (!verified) {
    return { error: "只有购买过该商品的顾客才能评价" };
  }

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "请选择 1-5 星评分" };
  }
  if (!comment) {
    return { error: "请填写评价内容" };
  }

  const name = customer.user_metadata?.name as string | undefined;
  const authorName = name?.trim() || customer.email?.split("@")[0] || "Anonymous";

  const { error } = await supabaseAdmin.from("product_reviews").insert({
    product_id: productId,
    customer_id: customer.id,
    rating,
    comment,
    author_name: authorName,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "已经评价过这个商品" };
    }
    return { error: dbErrorMessage(error) };
  }

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}
