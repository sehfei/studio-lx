import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBannerById } from "@/lib/banners";
import { BannerForm } from "../../BannerForm";

export const metadata: Metadata = { title: "Edit Banner" };
export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
