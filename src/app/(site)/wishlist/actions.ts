"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCustomer } from "@/lib/customer-auth";
import { dbErrorMessage } from "@/lib/db-error";

export type WishlistResult = {
  error?: string;
  inWishlist?: boolean;
  requiresLogin?: boolean;
};

export async function toggleWishlist(
  productId: string,
): Promise<WishlistResult> {
  const customer = await getCustomer();
  if (!customer) {
    return { requiresLogin: true };
  }

  const { data: existing, error: findError } = await supabaseAdmin
    .from("wishlist_items")
    .select("id")
    .eq("customer_id", customer.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (findError) {
    return { error: dbErrorMessage(findError) };
  }

  if (existing) {
    const { error } = await supabaseAdmin
      .from("wishlist_items")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: dbErrorMessage(error) };
    revalidatePath("/wishlist");
    return { inWishlist: false };
  }

  const { error } = await supabaseAdmin
    .from("wishlist_items")
    .insert({ customer_id: customer.id, product_id: productId });
  if (error) return { error: dbErrorMessage(error) };
  revalidatePath("/wishlist");
  return { inWishlist: true };
}
