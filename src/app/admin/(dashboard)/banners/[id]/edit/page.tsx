import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { getBannerById } from "@/lib/banners";
import { BannerForm } from "../../BannerForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const metadata: Metadata = { title: "Edit Banner" };
export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("banners");
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) notFound();
  const { t } = await getAdminI18n();
  const dict = t.pages.banners;

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.editPageTitle}</h1>
      <BannerForm banner={banner} dict={dict} common={t.common} />
    </div>
  );
}
