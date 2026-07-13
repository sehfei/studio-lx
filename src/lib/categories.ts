import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

// 分类曾经是写死在 constants.ts 的常量，现在改成后台可管理，
// 数据来自 categories 表。用 cache() 包一层，一次请求内多处读取只查一次库。
export type CategoryRow = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
};

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return data ?? [];
});
