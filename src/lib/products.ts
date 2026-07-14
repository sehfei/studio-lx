import { supabase } from "@/lib/supabase/client";
import type { Category, Gender, Tag } from "@/lib/constants";

export type Product = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  video?: string;
  colors: string[];
  sizes: string[];
  material: string;
  weight: string;
  shippingInfo: string;
  gender: Gender;
  category: Category;
  tags: Tag[];
  badgeText?: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  discount_price: number | null;
  stock: number;
  images: string[] | null;
  video: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  material: string | null;
  weight: string | null;
  shipping_info: string | null;
  gender: Product["gender"];
  category: Product["category"];
  tags: string[] | null;
  badge_text: string | null;
};

export function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    brand: row.brand,
    description: row.description,
    price: Number(row.price),
    discountPrice:
      row.discount_price != null ? Number(row.discount_price) : undefined,
    stock: row.stock,
    images: row.images ?? [],
    video: row.video ?? undefined,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    material: row.material ?? "",
    weight: row.weight ?? "",
    shippingInfo: row.shipping_info ?? "",
    gender: row.gender,
    category: row.category,
    tags: (row.tags ?? []) as Product["tags"],
    badgeText: row.badge_text ?? undefined,
  };
}

// 折扣百分比（100 -> 80 返回 20），四舍五入到整数
export function discountPercent(price: number, discountPrice: number): number {
  return Math.round((1 - discountPrice / price) * 100);
}

// 库存为 0 时自动显示缺货标签（优先级高于手动 Badge），
// 有库存时才显示商家手动填的 Badge（New/Hot/Sale 等）。
// stock 标签文字交给调用方翻译（outOfStockText），手动标签保持商家原文。
export function displayBadge(
  product: Pick<Product, "stock" | "badgeText">,
  outOfStockText = "Out of Stock",
): { text: string; variant: "default" | "stock" } | null {
  if (product.stock <= 0) {
    return { text: outOfStockText, variant: "stock" };
  }
  if (product.badgeText) {
    return { text: product.badgeText, variant: "default" };
  }
  return null;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getProductById(
  id: string,
): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return undefined;
  return data ? mapRow(data) : undefined;
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export async function getProductsByTag(
  tag: Product["tags"][number],
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .contains("tags", [tag]);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getProductsByGender(
  gender: Product["gender"],
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("gender", gender);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getProductsByGenderCategory(
  gender: Product["gender"],
  category: Product["category"],
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("gender", gender)
    .eq("category", category);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
