"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteBanner, toggleBannerActive } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function BannerRowActions({
  id,
  title,
  isActive,
  dict,
  common,
}: {
  id: string;
  title: string;
  isActive: boolean;
  dict: AdminDictionary["pages"]["banners"];
  common: AdminDictionary["common"];
}) {
  const [pending, startTransition] = useTransition();
  const label = title || dict.thisBanner;

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
        {isActive ? dict.deactivate : dict.activate}
      </button>
      <Link
        href={`/admin/banners/${id}/edit`}
        className="text-xs text-foreground/60 hover:text-gold hover:underline"
      >
        {common.edit}
      </Link>
      <button
        type="button"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
        onClick={() => {
          if (!confirm(dict.confirmDelete.replace("{name}", label))) {
            return;
          }
          startTransition(async () => {
            const result = await deleteBanner(id);
            if (result?.error) alert(result.error);
          });
        }}
      >
        {pending && <Spinner size="sm" />}
        {common.delete}
      </button>
    </div>
  );
}
