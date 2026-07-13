import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { BannerForm } from "../BannerForm";

export const metadata: Metadata = { title: "New Banner" };

export default async function NewBannerPage() {
  await requirePermission("banners");
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">新增 Banner</h1>
      <BannerForm />
    </div>
  );
}
