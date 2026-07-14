import { describe, expect, it } from "vitest";
import { uniqueViolationMessage, validateProduct } from "@/lib/validation/product";

const validGenders = ["women", "men"];
const validCategories = ["clothing", "shoes"];

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    name: "Test Product",
    sku: "SKU-1",
    brand: "Test Brand",
    description: "desc",
    price: "100",
    discountPrice: "",
    stock: "10",
    gender: "women",
    category: "clothing",
    colors: ["red"],
    sizes: ["M"],
    material: "cotton",
    weight: "1kg",
    shippingInfo: "info",
    tags: ["new-arrival"],
    badgeText: "",
    ...overrides,
  };
}

describe("validateProduct", () => {
  it("接受合法输入", () => {
    const result = validateProduct(validInput(), validCategories, validGenders);
    expect(result.error).toBeUndefined();
    expect(result.data?.name).toBe("Test Product");
    expect(result.data?.price).toBe(100);
  });

  it("必填字段缺失时报错", () => {
    const result = validateProduct(
      validInput({ name: "" }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBe("商品名称、SKU、品牌为必填");
  });

  it("价格不是正数时报错", () => {
    expect(
      validateProduct(validInput({ price: "0" }), validCategories, validGenders)
        .error,
    ).toBe("价格必须是大于 0 的数字");
    expect(
      validateProduct(validInput({ price: "abc" }), validCategories, validGenders)
        .error,
    ).toBe("价格必须是大于 0 的数字");
  });

  it("折扣价必须低于原价", () => {
    const result = validateProduct(
      validInput({ price: "100", discountPrice: "100" }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBe("折扣价必须低于原价");
  });

  it("折扣价合法时正常通过", () => {
    const result = validateProduct(
      validInput({ price: "100", discountPrice: "80" }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBeUndefined();
    expect(result.data?.discountPrice).toBe(80);
  });

  it("gender 不在白名单里报错", () => {
    const result = validateProduct(
      validInput({ gender: "alien" }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBe("请选择 Gender");
  });

  it("category 不在白名单里报错", () => {
    const result = validateProduct(
      validInput({ category: "unknown" }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBe("请选择 Category");
  });

  it("tags 里有非法标签时报错", () => {
    const result = validateProduct(
      validInput({ tags: ["not-a-real-tag"] }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBe("无效的标签：not-a-real-tag");
  });

  it("badgeText 超过 20 字符报错", () => {
    const result = validateProduct(
      validInput({ badgeText: "a".repeat(21) }),
      validCategories,
      validGenders,
    );
    expect(result.error).toBe("Badge 文字最多 20 个字符");
  });

  it("负数库存兜底成 0", () => {
    const result = validateProduct(
      validInput({ stock: "-5" }),
      validCategories,
      validGenders,
    );
    expect(result.data?.stock).toBe(0);
  });
});

describe("uniqueViolationMessage", () => {
  it("非唯一约束冲突返回 null", () => {
    expect(uniqueViolationMessage({ code: "23503", message: "x" })).toBeNull();
  });

  it("slug 冲突给出对应提示", () => {
    expect(
      uniqueViolationMessage({ code: "23505", message: "duplicate key slug" }),
    ).toBe("Slug 已存在，请换一个商品名称或手动指定 Slug");
  });

  it("sku 冲突给出对应提示", () => {
    expect(
      uniqueViolationMessage({ code: "23505", message: "duplicate key sku" }),
    ).toBe("SKU 已存在，请检查是否重复录入");
  });

  it("其他唯一约束冲突给出通用提示", () => {
    expect(
      uniqueViolationMessage({ code: "23505", message: "duplicate key other" }),
    ).toBe("商品信息与已有商品冲突（唯一性约束）");
  });
});
