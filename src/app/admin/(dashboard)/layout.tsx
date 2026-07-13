import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DeniedNotice } from "@/components/admin/DeniedNotice";
import { requireBackendUser, hasAdminPermission, isAdminUser } from "@/lib/auth";
import { getAdminI18n } from "@/lib/i18n/admin";
import { adminNavItems, type AdminPermissionKey } from "@/lib/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireBackendUser();
  const { locale, t } = await getAdminI18n();

  // dashboard 恒可见；users 只有真管理员能看（不进员工权限清单，见 admin-nav.ts）；
  // 其余按 staff 权限清单过滤，admin 永远全部可见。
  const visibleKeys = adminNavItems
    .filter((item) => {
      if (item.key === "dashboard") return true;
      if (item.key === "users") return isAdminUser(session);
      return hasAdminPermission(session, item.key as AdminPermissionKey);
    })
    .map((item) => item.key);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar dict={t.sidebar} visibleKeys={visibleKeys} />
      <div className="min-w-0 flex-1 p-4 sm:p-8">
        <AdminHeader
          email={session?.email ?? ""}
          locale={locale}
          dict={t.sidebar}
        />
        <DeniedNotice dict={t.sidebar} />
        {children}
      </div>
    </div>
  );
}
