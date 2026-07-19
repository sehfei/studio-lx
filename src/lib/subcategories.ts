import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

// 子分类挂在 category 下面（比如 Clothing 下面可以有 MIUMIU / LV / GUCCI），
// slug 全局唯一（跟 categories/genders 的 slug 一样），不是"分类内唯一"。
export type SubcategoryRow = {
  id: string;
  category: string;
  slug: string;
  label: string;
  sort_order: number;
  genders: string[];
};

export const getSubcategories = cache(async (): Promise<SubcategoryRow[]> => {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return data ?? [];
});

export async function getSubcategoriesByCategory(
  category: string,
): Promise<SubcategoryRow[]> {
  const all = await getSubcategories();
  return all.filter((s) => s.category === category);
}
