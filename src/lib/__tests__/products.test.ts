import { describe, expect, it } from "vitest";
import { discountPercent, displayBadge } from "@/lib/products";

describe("discountPercent", () => {
  it("计算折扣百分比并四舍五入", () => {
    expect(discountPercent(100, 80)).toBe(20);
    expect(discountPercent(100, 75)).toBe(25);
  });

  it("无折扣时返回 0", () => {
    expect(discountPercent(100, 100)).toBe(0);
  });
});

describe("displayBadge", () => {
  it("库存为 0 时显示缺货标签，优先级高于手动 badge", () => {
    expect(displayBadge({ stock: 0, badgeText: "Hot" })).toEqual({
      text: "Out of Stock",
      variant: "stock",
    });
  });

  it("库存为 0 时支持自定义缺货文案", () => {
    expect(displayBadge({ stock: 0, badgeText: undefined }, "缺货")).toEqual({
      text: "缺货",
      variant: "stock",
    });
  });

  it("有库存且有手动 badge 时显示手动 badge", () => {
    expect(displayBadge({ stock: 5, badgeText: "New" })).toEqual({
      text: "New",
      variant: "default",
    });
  });

  it("有库存且无手动 badge 时返回 null", () => {
    expect(displayBadge({ stock: 5, badgeText: undefined })).toBeNull();
  });
});
