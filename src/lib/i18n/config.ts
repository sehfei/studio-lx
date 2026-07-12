// 双语系统：cookie 存语言偏好，服务端组件读 cookie 选词典，前台顶部有切换按钮。
// 前台用 LOCALE_COOKIE，后台用独立的 ADMIN_LOCALE_COOKIE（见下方），两套互不影响。

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

// 后台语言独立于前台：单独的 cookie + 单独的默认值。
// 员工切后台语言不影响前台顾客看到的语言。后台默认英文。
export const ADMIN_DEFAULT_LOCALE: Locale = "en";
export const ADMIN_LOCALE_COOKIE = "admin_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}
