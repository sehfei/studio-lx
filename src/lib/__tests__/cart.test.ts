import { describe, expect, it } from "vitest";
import {
  cartCount,
  cartItemKey,
  cartSubtotal,
  readCart,
  type CartItem,
} from "@/lib/cart";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    slug: "p1",
    name: "Product 1",
    price: 100,
    quantity: 1,
    ...overrides,
  };
}

describe("cartItemKey", () => {
  it("相同商品+颜色+尺码生成相同 key", () => {
    const a = cartItemKey({ productId: "p1", color: "red", size: "M" });
    const b = cartItemKey({ productId: "p1", color: "red", size: "M" });
    expect(a).toBe(b);
  });

  it("颜色或尺码不同生成不同 key", () => {
    const a = cartItemKey({ productId: "p1", color: "red", size: "M" });
    const b = cartItemKey({ productId: "p1", color: "blue", size: "M" });
    expect(a).not.toBe(b);
  });

  it("颜色/尺码缺失时用空字符串占位", () => {
    expect(cartItemKey({ productId: "p1" })).toBe("p1____");
  });
});

describe("cartSubtotal", () => {
  it("按单价乘数量累加", () => {
    const items = [item({ price: 100, quantity: 2 }), item({ price: 50, quantity: 3 })];
    expect(cartSubtotal(items)).toBe(350);
  });

  it("空购物车小计为 0", () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("cartCount", () => {
  it("累加所有商品数量", () => {
    const items = [item({ quantity: 2 }), item({ quantity: 3 })];
    expect(cartCount(items)).toBe(5);
  });

  it("空购物车数量为 0", () => {
    expect(cartCount([])).toBe(0);
  });
});

describe("readCart（非浏览器环境）", () => {
  it("没有 window 时返回空数组，不报错", () => {
    expect(readCart()).toEqual([]);
  });
});
