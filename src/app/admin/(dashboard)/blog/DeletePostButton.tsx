"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deletePost } from "./actions";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(`确定删除「${title}」？不可恢复`)) return;
        startTransition(async () => {
          const result = await deletePost(id);
          if (result?.error) alert(result.error);
        });
      }}
    >
      {pending && <Spinner size="sm" />}
      {pending ? "删除中" : "删除"}
    </button>
  );
}
