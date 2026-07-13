import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { getBannerById } from "@/lib/banners";
import { BannerForm } from "../../BannerForm";

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

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">编辑 Banner</h1>
      <BannerForm banner={banner} />
    </div>
  );
}
