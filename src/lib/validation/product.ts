import { TAGS, type Category, type Gender } from "@/lib/constants";
import type { ProductImage } from "@/lib/products";
import type { AdminDictionary } from "@/lib/i18n/admin";

type ValidationDict = AdminDictionary["pages"]["products"]["validation"];

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
  subcategory: string | null;
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
  subcategory: string;
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
// validSubcategories 带上各自属于哪个 category，用来校验"子分类必须属于当前选的分类"。
export function validateProduct(
  raw: RawProductInput,
  validCategories: readonly string[],
  validGenders: readonly string[],
  dict: ValidationDict,
  validSubcategories: readonly { slug: string; category: string }[] = [],
): { data: ProductInput; error?: undefined } | { data?: undefined; error: string } {
  const name = toStr(raw.name);
  const sku = toStr(raw.sku);
  const brand = toStr(raw.brand);

  if (!name || !sku || !brand) {
    return { error: dict.requiredFields };
  }

  const price = Number(raw.price);
  if (!Number.isFinite(price) || price <= 0) {
    return { error: dict.invalidPrice };
  }

  let discountPrice: number | null = null;
  if (raw.discountPrice != null && raw.discountPrice !== "") {
    discountPrice = Number(raw.discountPrice);
    if (!Number.isFinite(discountPrice) || discountPrice <= 0) {
      return { error: dict.invalidDiscountPrice };
    }
    if (discountPrice >= price) {
      return { error: dict.discountPriceTooHigh };
    }
  }

  const gender = toStr(raw.gender) as Gender;
  if (!validGenders.includes(gender)) {
    return { error: dict.selectGender };
  }

  const category = toStr(raw.category) as Category;
  if (!validCategories.includes(category)) {
    return { error: dict.selectCategory };
  }

  const subcategoryRaw = toStr(raw.subcategory);
  let subcategory: string | null = null;
  if (subcategoryRaw) {
    const match = validSubcategories.find((s) => s.slug === subcategoryRaw);
    if (!match) {
      return { error: dict.invalidSubcategory };
    }
    if (match.category !== category) {
      return { error: dict.subcategoryMismatch };
    }
    subcategory = subcategoryRaw;
  }

  const tags = toStrArray(raw.tags);
  const invalidTag = tags.find((t) => !TAGS.includes(t as (typeof TAGS)[number]));
  if (invalidTag) {
    return { error: dict.invalidTag.replace("{tag}", invalidTag) };
  }

  const stockNum = Number(raw.stock);

  const badgeTextRaw = toStr(raw.badgeText);
  if (badgeTextRaw.length > 20) {
    return { error: dict.badgeTextTooLong };
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
      subcategory,
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
    subcategory: input.subcategory,
    tags: input.tags,
    badge_text: input.badgeText,
  };
}

// Postgres 唯一约束冲突 → 翻译后的提示
export function uniqueViolationMessage(
  error: { code?: string; message: string },
  dict: ValidationDict,
): string | null {
  if (error.code !== "23505") return null;
  if (error.message.includes("slug")) {
    return dict.slugExists;
  }
  if (error.message.includes("sku")) {
    return dict.skuExists;
  }
  return dict.genericConflict;
}
