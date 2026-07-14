import { describe, expect, it } from "vitest";
import {
  DEFAULT_SHIPPING_SETTINGS,
  calculateShippingFee,
  mergeShippingSettings,
  stateRegion,
} from "@/lib/shipping";

describe("stateRegion", () => {
  it("识别东马州属", () => {
    expect(stateRegion("Sabah")).toBe("east");
    expect(stateRegion("Sarawak")).toBe("east");
    expect(stateRegion("WP Labuan")).toBe("east");
  });

  it("识别西马州属", () => {
    expect(stateRegion("Selangor")).toBe("west");
    expect(stateRegion("WP Kuala Lumpur")).toBe("west");
  });

  it("未知州属返回 null", () => {
    expect(stateRegion("Atlantis")).toBeNull();
  });
});

describe("calculateShippingFee", () => {
  const settings = { westFee: 8, eastFee: 15, freeShippingThreshold: null };

  it("西马州属收西马运费", () => {
    expect(calculateShippingFee("Selangor", 50, settings)).toBe(8);
  });

  it("东马州属收东马运费", () => {
    expect(calculateShippingFee("Sabah", 50, settings)).toBe(15);
  });

  it("未知州属兜底按西马算", () => {
    expect(calculateShippingFee("Atlantis", 50, settings)).toBe(8);
  });

  it("达到免运费门槛时免运费", () => {
    const withThreshold = { ...settings, freeShippingThreshold: 200 };
    expect(calculateShippingFee("Sabah", 200, withThreshold)).toBe(0);
    expect(calculateShippingFee("Sabah", 199.99, withThreshold)).toBe(15);
  });
});

describe("mergeShippingSettings", () => {
  it("空值回退默认设置", () => {
    expect(mergeShippingSettings(null)).toEqual(DEFAULT_SHIPPING_SETTINGS);
    expect(mergeShippingSettings(undefined)).toEqual(DEFAULT_SHIPPING_SETTINGS);
  });

  it("部分字段缺失时用默认值补齐", () => {
    expect(mergeShippingSettings({ westFee: 12 })).toEqual({
      westFee: 12,
      eastFee: DEFAULT_SHIPPING_SETTINGS.eastFee,
      freeShippingThreshold: null,
    });
  });

  it("类型不对时忽略并用默认值", () => {
    expect(mergeShippingSettings({ westFee: "not a number" })).toEqual(
      DEFAULT_SHIPPING_SETTINGS,
    );
  });
});
