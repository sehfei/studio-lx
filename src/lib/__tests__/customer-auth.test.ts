import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/customer-auth";

describe("safeRedirectPath（防开放重定向）", () => {
  it("合法的站内相对路径原样返回", () => {
    expect(safeRedirectPath("/checkout")).toBe("/checkout");
  });

  it("null/undefined 回退到 /account", () => {
    expect(safeRedirectPath(null)).toBe("/account");
    expect(safeRedirectPath(undefined)).toBe("/account");
  });

  it("空字符串回退到 /account", () => {
    expect(safeRedirectPath("")).toBe("/account");
  });

  it("不以 / 开头的路径回退到 /account（防止跳外部域名）", () => {
    expect(safeRedirectPath("evil.com")).toBe("/account");
    expect(safeRedirectPath("http://evil.com")).toBe("/account");
  });

  it("协议相对 URL（// 开头）回退到 /account", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/account");
  });
});
