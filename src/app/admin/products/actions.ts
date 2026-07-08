"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProduct(
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const discountPriceRaw = String(formData.get("discountPrice") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "0");
  const gender = String(formData.get("gender") ?? "");
  const category = String(formData.get("category") ?? "");
  const colors = splitList(String(formData.get("colors") ?? ""));
  const sizes = splitList(String(formData.get("sizes") ?? ""));
  const material = String(formData.get("material") ?? "").trim();
  const weight = String(formData.get("weight") ?? "").trim();
  const shippingInfo = String(formData.get("shippingInfo") ?? "").trim();
  const tags = formData.getAll("tags").map(String);
  const slugInput = String(formData.get("slug") ?? "").trim();

  const price = Number(priceRaw);
  const discountPrice = discountPriceRaw ? Number(discountPriceRaw) : null;
  const stock = Number(stockRaw);

  if (!name || !sku || !brand) {
    return { error: "商品名称、SKU、品牌为必填" };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "价格必须是大于 0 的数字" };
  }
  if (gender !== "women" && gender !== "men") {
    return { error: "请选择 Gender" };
  }
  if (
    !["clothing", "shoes", "bags", "glasses", "accessories"].includes(
      category,
    )
  ) {
    return { error: "请选择 Category" };
  }

  const slug = slugify(slugInput || name);

  const { error } = await supabaseAdmin.from("products").insert({
    slug,
    name,
    sku,
    brand,
    description,
    price,
    discount_price: discountPrice,
    stock: Number.isFinite(stock) ? stock : 0,
    colors,
    sizes,
    material,
    weight,
    shipping_info: shippingInfo,
    gender,
    category,
    tags,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/${gender}`);
  revalidatePath(`/${gender}/${category}`);
  revalidatePath("/new-arrival");
  revalidatePath("/best-seller");
  revalidatePath("/promotion");
  revalidatePath("/sitemap.xml");

  redirect("/admin/products");
}
