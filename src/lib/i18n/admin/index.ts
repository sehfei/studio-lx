import { cookies } from "next/headers";
import { cache } from "react";
import {
  ADMIN_DEFAULT_LOCALE,
  ADMIN_LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "../config";
import { en } from "./en";
import { zh } from "./zh";

// 后台词典独立于前台：读独立的 admin_locale cookie，员工切后台语言不影响前台顾客。
export type AdminDictionary = typeof en;

const ADMIN_DICTIONARIES: Record<Locale, AdminDictionary> = { en, zh };

// 从 admin_locale cookie 读后台当前语言，服务端组件用。cache() 保证一次请求只读一次。
export const getAdminLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(ADMIN_LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : ADMIN_DEFAULT_LOCALE;
});

// 一步拿到后台 locale + 对应词典，后台页面里最常用
export const getAdminI18n = cache(async () => {
  const locale = await getAdminLocale();
  return { locale, t: ADMIN_DICTIONARIES[locale] ?? en };
});
