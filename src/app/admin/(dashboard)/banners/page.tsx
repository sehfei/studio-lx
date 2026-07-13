import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getAllBanners } from "@/lib/banners";
import { BannerRowActions } from "./BannerRowActions";

export const metadata: Metadata = { title: "Banner Management" };
export const dynamic = "force-dynamic";

function statusLabel(banner: {
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}): { text: string; className: string } {
  if (!banner.isActive) {
    return { text: "已下架", className: "bg-foreground/10 text-foreground/50" };
  }
  const now = Date.now();
  if (banner.startsAt && new Date(banner.startsAt).getTime() > now) {
    return { text: "待生效", className: "bg-gold/15 text-gold" };
  }
  if (banner.endsAt && new Date(banner.endsAt).getTime() < now) {
    return { text: "已过期", className: "bg-foreground/10 text-foreground/50" };
  }
  return { text: "显示中", className: "bg-gold/15 text-gold" };
}

export default async function AdminBannersPage() {
  await requirePermission("banners");
  const banners = await getAllBanners();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium">Banner Management</h1>
        <Link href="/admin/banners/new" className="btn-primary">
          + 新增 Banner
        </Link>
      </div>

      {banners.length === 0 ? (
        <p className="rounded-2xl border border-border-subtle p-8 text-center text-sm text-foreground/50">
          还没有 banner，点右上角新增第一个。
        </p>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => {
            const status = statusLabel(banner);
            return (
              <div
                key={banner.id}
                className="flex flex-col gap-4 rounded-2xl border border-border-subtle p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-border-subtle sm:w-40">
                  <Image
                    src={banner.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {banner.title || "（无标题）"}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                    >
                      {status.text}
                    </span>
                  </div>
                  {banner.subtitle && (
                    <p className="truncate text-xs text-foreground/50">
                      {banner.subtitle}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-foreground/40">
                    排序 {banner.sortOrder}
                  </p>
                </div>
                <BannerRowActions
                  id={banner.id}
                  title={banner.title}
                  isActive={banner.isActive}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
