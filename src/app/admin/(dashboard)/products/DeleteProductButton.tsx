"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteProduct } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function DeleteProductButton({
  id,
  name,
  dict,
  common,
}: {
  id: string;
  name: string;
  dict: AdminDictionary["pages"]["products"];
  common: AdminDictionary["common"];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(dict.confirmDelete.replace("{name}", name))) {
          return;
        }
        startTransition(async () => {
          const result = await deleteProduct(id);
          if (result?.error) {
            alert(result.error);
          }
        });
      }}
    >
      {pending && <Spinner size="sm" />}
      {pending ? common.deleting : common.delete}
    </button>
  );
}
