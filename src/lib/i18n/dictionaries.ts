import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { zh } from "./dictionaries/zh";

// 英文词典的结构即类型契约，中文词典必须实现同样的键
export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = { en, zh };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

// 从 cookie 读当前语言，服务端组件用。cache() 保证一次请求只读一次。
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

// 一步拿到 locale + 对应词典，页面里最常用
export const getI18n = cache(async () => {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
});
