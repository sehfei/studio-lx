import { cache } from "react";
import { supabase } from "@/lib/supabase/client";

// 主题设置：存在 Supabase theme_settings 表（id=1 单行 JSON），
// 后台 Website Settings 修改，根布局注入 CSS 变量全站生效。
// 表不存在或读取失败时静默回退到 DEFAULT_THEME，网站照常显示。

export type ThemeColors = {
  background: string;
  foreground: string;
  primary: string; // 主按钮色
  accent: string; // 强调色（金色）
  border: string;
  muted: string; // 次要文字
  destructive: string; // 删除/报错
};

export const FONT_PRESETS = [
  {
    id: "space-grotesk-inter",
    label: "Space Grotesk + Inter（现代，默认）",
    displayVar: "--font-space-grotesk",
    sansVar: "--font-inter",
  },
  {
    id: "playfair-inter",
    label: "Playfair + Inter（默认）",
    displayVar: "--font-playfair",
    sansVar: "--font-inter",
  },
  {
    id: "cormorant-montserrat",
    label: "Cormorant + Montserrat（奢华）",
    displayVar: "--font-cormorant",
    sansVar: "--font-montserrat",
  },
  {
    id: "marcellus-inter",
    label: "Marcellus + Inter（简约）",
    displayVar: "--font-marcellus",
    sansVar: "--font-inter",
  },
  {
    id: "garamond-lato",
    label: "EB Garamond + Lato（经典）",
    displayVar: "--font-garamond",
    sansVar: "--font-lato",
  },
  {
    id: "bodoni-jost",
    label: "Bodoni Moda + Jost（高对比极简）",
    displayVar: "--font-bodoni",
    sansVar: "--font-jost",
  },
] as const;

export type FontPresetId = (typeof FONT_PRESETS)[number]["id"];

export const RADIUS_OPTIONS = [0, 4, 8, 12] as const;

// spacing 是 Tailwind v4 里 p-*/m-*/gap-* 等间距工具类的基准倍率，
// 三档之间要有能感知到的差距，宽松档刻意比标准宽不少，贴近高端网站常见的大留白
export const DENSITY_OPTIONS = [
  { id: "compact", label: "紧凑", spacing: "0.2rem" },
  { id: "normal", label: "标准", spacing: "0.25rem" },
  { id: "relaxed", label: "宽松", spacing: "0.3125rem" },
] as const;

export type DensityId = (typeof DENSITY_OPTIONS)[number]["id"];

export const BUTTON_STYLE_OPTIONS = [
  { id: "filled", label: "实心" },
  { id: "soft", label: "柔和" },
  { id: "outline", label: "描边" },
  { id: "ghost", label: "幽灵" },
] as const;

export type ButtonStyleId = (typeof BUTTON_STYLE_OPTIONS)[number]["id"];

// 按钮尺寸：影响 .btn-primary/.btn-outline 的内边距、最小高度、字号。
// 后台某些页面（比如 Products 列表头部的 + Add Product）用的是同一套按钮类，
// 紧凑档专门给这类小的「新增一行」按钮用，不用另外开一套样式。
export const BUTTON_SIZE_OPTIONS = [
  {
    id: "compact",
    label: "紧凑",
    minH: "2.25rem",
    paddingX: "1rem",
    paddingY: "0.5rem",
    fontSize: "0.75rem",
  },
  {
    id: "normal",
    label: "标准（默认）",
    minH: "2.75rem",
    paddingX: "1.5rem",
    paddingY: "0.75rem",
    fontSize: "0.875rem",
  },
  {
    id: "spacious",
    label: "宽松",
    minH: "3.25rem",
    paddingX: "2rem",
    paddingY: "1rem",
    fontSize: "0.875rem",
  },
] as const;

export type ButtonSizeId = (typeof BUTTON_SIZE_OPTIONS)[number]["id"];

export type ThemeSettings = {
  colors: ThemeColors;
  fontPreset: FontPresetId;
  radius: number;
  density: DensityId;
  buttonStyle: ButtonStyleId;
  buttonSize: ButtonSizeId;
};

export const DEFAULT_THEME: ThemeSettings = {
  colors: {
    background: "#fdfbf9",
    foreground: "#111111",
    primary: "#111111",
    accent: "#a9824c",
    border: "#e5e2dd",
    muted: "#6b6560",
    destructive: "#dc2626",
  },
  fontPreset: "space-grotesk-inter",
  radius: 0,
  density: "normal",
  buttonStyle: "filled",
  buttonSize: "normal",
};

// 预设配色方案：只覆盖 colors，字体/圆角/间距/按钮风格保留用户当前选择。
// 背景统一用带一点暖色的白（而不是纯 #ffffff），这是奢侈品牌网站的常见手法——
// 纯白偏「科技感/廉价」，暖白偏「精品店/编辑感」。极简黑白是唯一刻意保留纯白的例外。
export const THEME_PRESETS: { id: string; label: string; colors: ThemeColors }[] = [
  {
    id: "noir-gold",
    label: "黑金（默认）",
    colors: {
      background: "#fdfbf9",
      foreground: "#111111",
      primary: "#111111",
      accent: "#a9824c",
      border: "#e5e2dd",
      muted: "#6b6560",
      destructive: "#dc2626",
    },
  },
  {
    id: "champagne",
    label: "香槟米白",
    colors: {
      background: "#fdfbf7",
      foreground: "#2b2622",
      primary: "#2b2622",
      accent: "#b08d57",
      border: "#e8ddc9",
      muted: "#8a7f6d",
      destructive: "#b3261e",
    },
  },
  {
    id: "navy-gold",
    label: "深蓝商务",
    colors: {
      background: "#f9fafb",
      foreground: "#10192b",
      primary: "#10192b",
      accent: "#c19a49",
      border: "#dfe3ea",
      muted: "#5b6472",
      destructive: "#c0392b",
    },
  },
  {
    id: "rose-blush",
    label: "玫瑰金粉",
    colors: {
      background: "#fff9f8",
      foreground: "#2e2422",
      primary: "#2e2422",
      accent: "#c98a7d",
      border: "#f0dcd6",
      muted: "#8a7570",
      destructive: "#b3402f",
    },
  },
  {
    id: "emerald-gold",
    label: "墨绿奢华",
    colors: {
      background: "#f9faf7",
      foreground: "#12201b",
      primary: "#12201b",
      accent: "#b08d57",
      border: "#dfe6e1",
      muted: "#5f6b64",
      destructive: "#b3261e",
    },
  },
  {
    id: "monochrome",
    label: "极简黑白",
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      primary: "#000000",
      accent: "#000000",
      border: "#dddddd",
      muted: "#767676",
      destructive: "#cc0000",
    },
  },
];

// 部分字段缺失时用默认值补齐（老数据兼容）
export function mergeTheme(partial: unknown): ThemeSettings {
  const p = (partial ?? {}) as Partial<ThemeSettings>;
  return {
    colors: { ...DEFAULT_THEME.colors, ...(p.colors ?? {}) },
    fontPreset: FONT_PRESETS.some((f) => f.id === p.fontPreset)
      ? (p.fontPreset as FontPresetId)
      : DEFAULT_THEME.fontPreset,
    radius: RADIUS_OPTIONS.includes(p.radius as (typeof RADIUS_OPTIONS)[number])
      ? (p.radius as number)
      : DEFAULT_THEME.radius,
    density: DENSITY_OPTIONS.some((d) => d.id === p.density)
      ? (p.density as DensityId)
      : DEFAULT_THEME.density,
    buttonStyle: BUTTON_STYLE_OPTIONS.some((b) => b.id === p.buttonStyle)
      ? (p.buttonStyle as ButtonStyleId)
      : DEFAULT_THEME.buttonStyle,
    buttonSize: BUTTON_SIZE_OPTIONS.some((b) => b.id === p.buttonSize)
      ? (p.buttonSize as ButtonSizeId)
      : DEFAULT_THEME.buttonSize,
  };
}

// 按钮风格 -> CSS 变量，主题注入（服务端根布局）和后台预览（客户端）共用，
// 避免两处各写一份逻辑导致预览和实际效果不一致。
export function buttonStyleVars(
  buttonStyle: ButtonStyleId,
): Record<string, string> {
  switch (buttonStyle) {
    case "filled":
      return {
        "--btn-bg": "var(--primary)",
        "--btn-fg": "var(--background)",
        "--btn-border": "var(--primary)",
      };
    case "soft":
      return {
        "--btn-bg": "color-mix(in srgb, var(--primary) 12%, var(--background))",
        "--btn-fg": "var(--primary)",
        "--btn-border": "transparent",
      };
    case "ghost":
      return {
        "--btn-bg": "transparent",
        "--btn-fg": "var(--primary)",
        "--btn-border": "transparent",
      };
    case "outline":
    default:
      return {
        "--btn-bg": "transparent",
        "--btn-fg": "var(--primary)",
        "--btn-border": "var(--primary)",
      };
  }
}

// 按钮尺寸 -> CSS 变量，同 buttonStyleVars，主题注入和后台预览共用。
export function buttonSizeVars(
  buttonSize: ButtonSizeId,
): Record<string, string> {
  const size =
    BUTTON_SIZE_OPTIONS.find((b) => b.id === buttonSize) ??
    BUTTON_SIZE_OPTIONS[1];
  return {
    "--btn-min-h": size.minH,
    "--btn-px": size.paddingX,
    "--btn-py": size.paddingY,
    "--btn-text": size.fontSize,
  };
}

export const getTheme = cache(async (): Promise<ThemeSettings> => {
  try {
    const { data, error } = await supabase
      .from("theme_settings")
      .select("theme")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_THEME;
    return mergeTheme(data.theme);
  } catch {
    return DEFAULT_THEME;
  }
});

// 转成注入 <html style> 的 CSS 变量
export function themeToCssVars(theme: ThemeSettings): Record<string, string> {
  const font =
    FONT_PRESETS.find((f) => f.id === theme.fontPreset) ?? FONT_PRESETS[0];
  const density =
    DENSITY_OPTIONS.find((d) => d.id === theme.density) ?? DENSITY_OPTIONS[1];

  return {
    "--background": theme.colors.background,
    "--foreground": theme.colors.foreground,
    "--primary": theme.colors.primary,
    "--gold": theme.colors.accent,
    "--border-subtle": theme.colors.border,
    "--muted": theme.colors.muted,
    "--destructive": theme.colors.destructive,
    "--radius": `${theme.radius}px`,
    "--spacing-scale": density.spacing,
    "--font-display-active": `var(${font.displayVar})`,
    "--font-sans-active": `var(${font.sansVar})`,
    ...buttonStyleVars(theme.buttonStyle),
    ...buttonSizeVars(theme.buttonSize),
  };
}

// WCAG 相对亮度对比度（1~21），保存时用来防止文字看不清
export function contrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const n = hex.replace("#", "");
    const rgb = [0, 2, 4].map((i) => {
      const c = parseInt(n.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const [a, b] = [lum(hex1), lum(hex2)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
