"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteCategory } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function DeleteCategoryButton({
  id,
  slug,
  label,
  dict,
  common,
}: {
  id: string;
  slug: string;
  label: string;
  dict: AdminDictionary["pages"]["categories"];
  common: AdminDictionary["common"];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(dict.confirmDelete.replace("{name}", label))) return;
        startTransition(async () => {
          const result = await deleteCategory(id, slug);
          if (result?.error) alert(result.error);
        });
      }}
    >
      {pending && <Spinner size="sm" />}
      {pending ? common.deleting : common.delete}
    </button>
  );
}
