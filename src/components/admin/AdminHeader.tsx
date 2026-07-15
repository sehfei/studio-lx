import Link from "next/link";
import { signOut } from "@/app/admin/login/actions";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import type { AdminDictionary } from "@/lib/i18n/admin";

// 后台内容区右上角 header：账号 · 返回前台 · 语言切换 · 登出。
// 这些原本散在侧栏里，统一收到右上角一处。
export function AdminHeader({
  email,
  locale,
  dict,
}: {
  email: string;
  locale: Locale;
  dict: AdminDictionary["sidebar"];
}) {
  return (
    <header className="mb-6 hidden items-center justify-end gap-x-4 border-b border-border-subtle pb-4 text-xs lg:flex">
      <span className="mr-auto truncate text-foreground/50" title={email}>
        {email}
      </span>
      <Link href="/" className="text-foreground/50 hover:text-gold">
        {dict.backToSite}
      </Link>
      <span className="text-foreground/20">|</span>
      <AdminLanguageSwitcher current={locale} />
      <span className="text-foreground/20">|</span>
      <form action={signOut}>
        <button type="submit" className="text-foreground/50 hover:text-gold">
          {dict.signOut}
        </button>
      </form>
    </header>
  );
}
