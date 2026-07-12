import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const { locale, t } = await getAdminI18n();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar dict={t.sidebar} />
      <div className="min-w-0 flex-1 p-4 sm:p-8">
        <AdminHeader
          email={session?.email ?? ""}
          locale={locale}
          dict={t.sidebar}
        />
        {children}
      </div>
    </div>
  );
}
