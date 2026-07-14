"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { deleteGender } from "./actions";

export function DeleteGenderButton({
  id,
  slug,
  label,
}: {
  id: string;
  slug: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(`确定删除分区「${label}」？`)) return;
        startTransition(async () => {
          const result = await deleteGender(id, slug);
          if (result?.error) alert(result.error);
        });
      }}
    >
      {pending && <Spinner size="sm" />}
      {pending ? "删除中" : "删除"}
    </button>
  );
}
