"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { markMessageRead } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function MarkReadButton({
  id,
  dict,
}: {
  id: string;
  dict: AdminDictionary["pages"]["messages"];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await markMessageRead(id);
        });
      }}
      className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-gold hover:underline"
    >
      {pending && <Spinner size="sm" />}
      {dict.markAsRead}
    </button>
  );
}
