import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { BannerForm } from "../BannerForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "New Banner" };

export default async function NewBannerPage() {
  await requirePermission("banners");
  const { t } = await getAdminI18n();
  const dict = t.pages.banners;
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.newPageTitle}</h1>
      <BannerForm dict={dict} common={t.common} />
    </div>
  );
}
