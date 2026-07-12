"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteProduct } from "./actions";

export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(`确定删除「${name}」？商品和图片都会被删除，不可恢复`)) {
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
      {pending ? "删除中" : "删除"}
    </button>
  );
}
