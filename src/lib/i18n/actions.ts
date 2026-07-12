"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_LOCALE_COOKIE,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./config";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 记住一年
    sameSite: "lax",
  });
  // 语言注入在服务端组件，改 cookie 后要刷新整站
  revalidatePath("/", "layout");
}

// 后台语言切换：写独立的 admin_locale cookie，只刷新后台，不动前台。
export async function setAdminLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/admin", "layout");
}
