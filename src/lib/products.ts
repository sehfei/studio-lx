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
  images: string[]; // 之后接 Supabase Storage 后放真实图片 URL
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

// 占位数据，之后会换成 Supabase 数据库读取
export const placeholderProducts: Product[] = [
  {
    id: "1",
    slug: "silk-tailored-blazer",
    name: "Silk Tailored Blazer",
    sku: "LX-W-CL-0001",
    brand: "STUDIO LX",
    description: "极简剪裁真丝西装外套，适合日常与晚宴场合。",
    price: 890,
    discountPrice: 690,
    stock: 12,
    images: [],
    colors: ["Black", "Ivory"],
    sizes: ["XS", "S", "M", "L"],
    material: "100% Silk",
    weight: "0.6kg",
    shippingInfo: "西马 2-4 工作日，东马 4-7 工作日",
    gender: "women",
    category: "clothing",
    tags: ["new-arrival", "promotion"],
    reviews: [],
  },
  {
    id: "2",
    slug: "leather-ankle-boots",
    name: "Leather Ankle Boots",
    sku: "LX-W-SH-0002",
    brand: "STUDIO LX",
    description: "意大利小牛皮踝靴，手工缝制鞋底。",
    price: 1290,
    stock: 8,
    images: [],
    colors: ["Black", "Brown"],
    sizes: ["36", "37", "38", "39", "40"],
    material: "Full-grain Leather",
    weight: "1.1kg",
    shippingInfo: "西马 2-4 工作日，东马 4-7 工作日",
    gender: "women",
    category: "shoes",
    tags: ["best-seller"],
    reviews: [],
  },
  {
    id: "3",
    slug: "structured-tote-bag",
    name: "Structured Tote Bag",
    sku: "LX-W-BG-0003",
    brand: "STUDIO LX",
    description: "结构感托特包，大容量商务日常两用。",
    price: 1590,
    stock: 5,
    images: [],
    colors: ["Camel", "Black"],
    sizes: ["One Size"],
    material: "Saffiano Leather",
    weight: "0.9kg",
    shippingInfo: "西马 2-4 工作日，东马 4-7 工作日",
    gender: "women",
    category: "bags",
    tags: ["best-seller", "new-arrival"],
    reviews: [],
  },
  {
    id: "4",
    slug: "classic-wool-overcoat",
    name: "Classic Wool Overcoat",
    sku: "LX-M-CL-0004",
    brand: "STUDIO LX",
    description: "经典羊毛大衣，剪裁利落，适合都市通勤。",
    price: 1690,
    discountPrice: 1290,
    stock: 10,
    images: [],
    colors: ["Charcoal", "Camel"],
    sizes: ["S", "M", "L", "XL"],
    material: "90% Wool, 10% Cashmere",
    weight: "1.4kg",
    shippingInfo: "西马 2-4 工作日，东马 4-7 工作日",
    gender: "men",
    category: "clothing",
    tags: ["promotion"],
    reviews: [],
  },
  {
    id: "5",
    slug: "acetate-sunglasses",
    name: "Acetate Sunglasses",
    sku: "LX-M-GL-0005",
    brand: "STUDIO LX",
    description: "意大利板材眼镜框，UV400 防护镜片。",
    price: 590,
    stock: 20,
    images: [],
    colors: ["Tortoise", "Black"],
    sizes: ["One Size"],
    material: "Acetate",
    weight: "0.03kg",
    shippingInfo: "西马 2-4 工作日，东马 4-7 工作日",
    gender: "men",
    category: "glasses",
    tags: ["new-arrival"],
    reviews: [],
  },
  {
    id: "6",
    slug: "minimal-leather-sneakers",
    name: "Minimal Leather Sneakers",
    sku: "LX-M-SH-0006",
    brand: "STUDIO LX",
    description: "极简小白鞋，头层牛皮，橡胶大底。",
    price: 790,
    stock: 15,
    images: [],
    colors: ["White", "Black"],
    sizes: ["40", "41", "42", "43", "44"],
    material: "Leather",
    weight: "0.8kg",
    shippingInfo: "西马 2-4 工作日，东马 4-7 工作日",
    gender: "men",
    category: "shoes",
    tags: ["best-seller"],
    reviews: [],
  },
];

export function getProductBySlug(slug: string) {
  return placeholderProducts.find((p) => p.slug === slug);
}

export function getProductsByTag(tag: Product["tags"][number]) {
  return placeholderProducts.filter((p) => p.tags.includes(tag));
}

export function getProductsByGender(gender: Product["gender"]) {
  return placeholderProducts.filter((p) => p.gender === gender);
}
