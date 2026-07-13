// 免注册购物车：整个购物车只存在浏览器 localStorage，不落库。
// 价格/库存不可信——结账时服务端会用商品 id 重新查真实价格和库存，
// 这里存的 price/name/image 只用于购物车页面展示，不参与最终金额计算。

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
  color?: string;
  size?: string;
  quantity: number;
};

const STORAGE_KEY = "studio-lx-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// 同商品+同颜色+同尺码算一行，数量相加
export function cartItemKey(item: Pick<CartItem, "productId" | "color" | "size">) {
  return `${item.productId}__${item.color ?? ""}__${item.size ?? ""}`;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
