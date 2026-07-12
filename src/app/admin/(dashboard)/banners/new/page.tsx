import type { Metadata } from "next";
import { BannerForm } from "../BannerForm";

export const metadata: Metadata = { title: "New Banner" };

export default function NewBannerPage() {
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">新增 Banner</h1>
      <BannerForm />
    </div>
  );
}
