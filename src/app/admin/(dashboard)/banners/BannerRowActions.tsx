"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteBanner, toggleBannerActive } from "./actions";

export function BannerRowActions({
  id,
  title,
  isActive,
}: {
  id: string;
  title: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const label = title || "此 banner";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        className="text-xs text-foreground/60 hover:text-gold disabled:opacity-50"
        onClick={() => {
          startTransition(async () => {
            const result = await toggleBannerActive(id, !isActive);
            if (result?.error) alert(result.error);
          });
        }}
      >
        {isActive ? "下架" : "上架"}
      </button>
      <Link
        href={`/admin/banners/${id}/edit`}
        className="text-xs text-foreground/60 hover:text-gold hover:underline"
      >
        编辑
      </Link>
      <button
        type="button"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
        onClick={() => {
          if (!confirm(`确定删除「${label}」？图片也会一起删除，不可恢复`)) {
            return;
          }
          startTransition(async () => {
            const result = await deleteBanner(id);
            if (result?.error) alert(result.error);
          });
        }}
      >
        {pending && <Spinner size="sm" />}
        删除
      </button>
    </div>
  );
}
