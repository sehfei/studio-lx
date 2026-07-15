import { TAGS, type Category, type Gender } from "@/lib/constants";
import type { ProductImage } from "@/lib/products";

// 商品写入的共享校验：admin Server Action 和 /api/admin/products 都走这里，
// 保证两个入口的规则一致。

export type ProductInput = {
  name: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  colors: string[];
  sizes: string[];
  material: string;
  weight: string;
  shippingInfo: string;
  gender: Gender;
  category: Category;
  tags: string[];
  badgeText: string | null;
};

type RawProductInput = {
  [K in keyof ProductInput]?: unknown;
};

// 表单提交失败时随错误一起返回的原始值，用于回填表单（React 19
// 的 form action 提交后会重置未受控输入，不带回去就全清空了）
export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  gender: string;
  category: string;
  colors: string;
  sizes: string;
  material: string;
  weight: string;
  shippingInfo: string;
  tags: string[];
  badgeText: string;
};

export type ProductFormState =
  | { error: string; values: ProductFormValues }
  | undefined;

function toStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

// validGenders/validCategories 是调用方先查好的性别表/分类表 slug 列表
// （性别和分类现在都是后台可管理的，不再是编译期固定的几个值，
// 校验时必须传入当前真实存在的值）。
export function validateProduct(
  raw: RawProductInput,
  validCategories: readonly string[],
  validGenders: readonly string[],
): { data: ProductInput; error?: undefined } | { data?: undefined; error: string } {
  const name = toStr(raw.name);
  const sku = toStr(raw.sku);
  const brand = toStr(raw.brand);

  if (!name || !sku || !brand) {
    return { error: "商品名称、SKU、品牌为必填" };
  }

  const price = Number(raw.price);
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "价格必须是大于 0 的数字" };
  }

  let discountPrice: number | null = null;
  if (raw.discountPrice != null && raw.discountPrice !== "") {
    discountPrice = Number(raw.discountPrice);
    if (!Number.isFinite(discountPrice) || discountPrice <= 0) {
      return { error: "折扣价必须是大于 0 的数字" };
    }
    if (discountPrice >= price) {
      return { error: "折扣价必须低于原价" };
    }
  }

  const gender = toStr(raw.gender) as Gender;
  if (!validGenders.includes(gender)) {
    return { error: "请选择 Gender" };
  }

  const category = toStr(raw.category) as Category;
  if (!validCategories.includes(category)) {
    return { error: "请选择 Category" };
  }

  const tags = toStrArray(raw.tags);
  const invalidTag = tags.find((t) => !TAGS.includes(t as (typeof TAGS)[number]));
  if (invalidTag) {
    return { error: `无效的标签：${invalidTag}` };
  }

  const stockNum = Number(raw.stock);

  const badgeTextRaw = toStr(raw.badgeText);
  if (badgeTextRaw.length > 20) {
    return { error: "Badge 文字最多 20 个字符" };
  }

  return {
    data: {
      name,
      sku,
      brand,
      description: toStr(raw.description),
      price,
      discountPrice,
      stock: Number.isFinite(stockNum) && stockNum >= 0 ? Math.floor(stockNum) : 0,
      colors: toStrArray(raw.colors),
      sizes: toStrArray(raw.sizes),
      material: toStr(raw.material),
      weight: toStr(raw.weight),
      shippingInfo: toStr(raw.shippingInfo),
      gender,
      category,
      tags,
      badgeText: badgeTextRaw || null,
    },
  };
}

// JSON API 的 images 输入：支持纯网址字符串（alt 用 fallbackAlt 兜底）或 { url, alt } 对象
export function parseImagesInput(raw: unknown, fallbackAlt: string): ProductImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((img): ProductImage | null => {
      if (typeof img === "string" && img.trim()) {
        return { url: img.trim(), alt: fallbackAlt };
      }
      if (
        img &&
        typeof img === "object" &&
        typeof (img as { url?: unknown }).url === "string"
      ) {
        const url = (img as { url: string }).url.trim();
        if (!url) return null;
        const altRaw = (img as { alt?: unknown }).alt;
        const alt =
          typeof altRaw === "string" && altRaw.trim() ? altRaw.trim() : fallbackAlt;
        return { url, alt };
      }
      return null;
    })
    .filter((img): img is ProductImage => img !== null);
}

// 转成 products 表的插入行（snake_case）
export function productInputToRow(
  input: ProductInput,
  slug: string,
  images: ProductImage[],
) {
  return {
    slug,
    name: input.name,
    sku: input.sku,
    brand: input.brand,
    description: input.description,
    price: input.price,
    discount_price: input.discountPrice,
    stock: input.stock,
    images,
    colors: input.colors,
    sizes: input.sizes,
    material: input.material,
    weight: input.weight,
    shipping_info: input.shippingInfo,
    gender: input.gender,
    category: input.category,
    tags: input.tags,
    badge_text: input.badgeText,
  };
}

// Postgres 唯一约束冲突 → 中文提示
export function uniqueViolationMessage(error: {
  code?: string;
  message: string;
}): string | null {
  if (error.code !== "23505") return null;
  if (error.message.includes("slug")) {
    return "Slug 已存在，请换一个商品名称或手动指定 Slug";
  }
  if (error.message.includes("sku")) {
    return "SKU 已存在，请检查是否重复录入";
  }
  return "商品信息与已有商品冲突（唯一性约束）";
}
