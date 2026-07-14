import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

// 马来西亚 13 州 + 3 联邦直辖区，标记东马/西马，结账时按顾客选的州属算运费。
// 沙巴、砂拉越、纳闽是东马，其余是西马。
export const MALAYSIA_STATES = [
  { name: "Johor", region: "west" },
  { name: "Kedah", region: "west" },
  { name: "Kelantan", region: "west" },
  { name: "Malacca", region: "west" },
  { name: "Negeri Sembilan", region: "west" },
  { name: "Pahang", region: "west" },
  { name: "Penang", region: "west" },
  { name: "Perak", region: "west" },
  { name: "Perlis", region: "west" },
  { name: "Selangor", region: "west" },
  { name: "Terengganu", region: "west" },
  { name: "WP Kuala Lumpur", region: "west" },
  { name: "WP Putrajaya", region: "west" },
  { name: "Sabah", region: "east" },
  { name: "Sarawak", region: "east" },
  { name: "WP Labuan", region: "east" },
] as const;

export type MalaysiaState = (typeof MALAYSIA_STATES)[number]["name"];
export type ShippingRegion = "west" | "east";

export type ShippingSettings = {
  westFee: number;
  eastFee: number;
  freeShippingThreshold: number | null;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  westFee: 8,
  eastFee: 15,
  freeShippingThreshold: null,
};

export function stateRegion(state: string): ShippingRegion | null {
  const match = MALAYSIA_STATES.find((s) => s.name === state);
  return match ? match.region : null;
}

export function mergeShippingSettings(partial: unknown): ShippingSettings {
  const p = (partial ?? {}) as Partial<ShippingSettings>;
  return {
    westFee:
      typeof p.westFee === "number"
        ? p.westFee
        : DEFAULT_SHIPPING_SETTINGS.westFee,
    eastFee:
      typeof p.eastFee === "number"
        ? p.eastFee
        : DEFAULT_SHIPPING_SETTINGS.eastFee,
    freeShippingThreshold:
      typeof p.freeShippingThreshold === "number"
        ? p.freeShippingThreshold
        : null,
  };
}

export const getShippingSettings = cache(async (): Promise<ShippingSettings> => {
  try {
    const { data, error } = await supabase
      .from("shipping_settings")
      .select("shipping")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_SHIPPING_SETTINGS;
    return mergeShippingSettings(data.shipping);
  } catch {
    return DEFAULT_SHIPPING_SETTINGS;
  }
});

// 结账时算运费：州属对不上（不是马来西亚 13+3 之一）就当西马处理，
// 免运费门槛达到就直接免运费
export function calculateShippingFee(
  state: string,
  subtotal: number,
  settings: ShippingSettings,
): number {
  if (
    settings.freeShippingThreshold !== null &&
    subtotal >= settings.freeShippingThreshold
  ) {
    return 0;
  }
  const region = stateRegion(state) ?? "west";
  return region === "east" ? settings.eastFee : settings.westFee;
}
