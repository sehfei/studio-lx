"use server";

import { getNavProducts, type NavProduct, type Product } from "@/lib/products";

// 导航菜单手风琴展开商品列表时用，客户端组件直接调用这个 Server Action。
export async function fetchNavProducts(
  gender: Product["gender"],
  category: Product["category"],
  subcategory?: string,
): Promise<NavProduct[]> {
  return getNavProducts(gender, category, subcategory);
}
