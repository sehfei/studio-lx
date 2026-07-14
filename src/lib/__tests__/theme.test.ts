import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, contrastRatio, mergeTheme } from "@/lib/theme";

describe("contrastRatio", () => {
  it("黑白对比度是已知的 WCAG 值 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("相同颜色对比度是 1:1", () => {
    expect(contrastRatio("#a9824c", "#a9824c")).toBeCloseTo(1, 5);
  });

  it("顺序不影响结果", () => {
    const a = contrastRatio("#111111", "#fdfbf9");
    const b = contrastRatio("#fdfbf9", "#111111");
    expect(a).toBeCloseTo(b, 10);
  });
});

describe("mergeTheme", () => {
  it("空值回退默认主题", () => {
    expect(mergeTheme(null)).toEqual(DEFAULT_THEME);
  });

  it("未知 fontPreset 回退默认值", () => {
    const merged = mergeTheme({ fontPreset: "does-not-exist" });
    expect(merged.fontPreset).toBe(DEFAULT_THEME.fontPreset);
  });

  it("合法的 radius 保留原值", () => {
    expect(mergeTheme({ radius: 8 }).radius).toBe(8);
  });

  it("非法的 radius 回退默认值", () => {
    expect(mergeTheme({ radius: 999 }).radius).toBe(DEFAULT_THEME.radius);
  });

  it("colors 部分缺失时逐个字段补齐默认值", () => {
    const merged = mergeTheme({ colors: { accent: "#ff0000" } });
    expect(merged.colors.accent).toBe("#ff0000");
    expect(merged.colors.background).toBe(DEFAULT_THEME.colors.background);
  });
});
