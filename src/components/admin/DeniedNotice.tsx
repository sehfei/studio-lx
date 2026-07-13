"use client";

import { useSearchParams } from "next/navigation";
import type { AdminDictionary } from "@/lib/i18n/admin";

// 员工点了侧栏没有的链接、或者直接改 URL 访问没权限的后台页面时，
// requirePermission() 会把它们弹回 /admin?denied=<key>，这里读出来提示一下，
// 不是空白页/报错，用户知道是权限不够而不是网站坏了。
export function DeniedNotice({ dict }: { dict: AdminDictionary["sidebar"] }) {
  const searchParams = useSearchParams();
  const deniedKey = searchParams.get("denied");
  if (!deniedKey) return null;

  const label = dict.nav[deniedKey] ?? deniedKey;

  return (
    <div className="mb-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {dict.deniedAccessPrefix}
      {label}
      {dict.deniedAccessSuffix}
    </div>
  );
}
