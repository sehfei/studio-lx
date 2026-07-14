import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("转小写并用连字符替换空格", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("去除首尾连字符", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("连续非字母数字字符合并成一个连字符", () => {
    expect(slugify("A!!!B???C")).toBe("a-b-c");
  });

  it("保留数字", () => {
    expect(slugify("Product 123")).toBe("product-123");
  });

  it("空字符串返回空字符串", () => {
    expect(slugify("")).toBe("");
  });
});
