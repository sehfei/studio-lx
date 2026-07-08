import { supabase } from "@/lib/supabase/client";

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
  gender: "women" | "men";
  category: "clothing" | "shoes" | "bags" | "glasses" | "accessories";
  tags: ("new-arrival" | "best-seller" | "promotion")[];
  reviews: { author: string; rating: number; comment: string }[];
};

type ProductRow = {
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
};

function mapRow(row: ProductRow): Product {
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
    reviews: [], // 评价表之后再接
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
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
