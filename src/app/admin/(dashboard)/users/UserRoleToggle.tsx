"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { toggleAdminRole } from "./actions";

export function UserRoleToggle({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          isAdmin &&
          !confirm("确定取消这个账号的管理员权限？")
        ) {
          return;
        }
        startTransition(async () => {
          const result = await toggleAdminRole(userId, !isAdmin);
          if (result?.error) alert(result.error);
        });
      }}
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs ${
        isAdmin
          ? "border-destructive/40 text-destructive hover:bg-destructive/5"
          : "border-gold/40 text-gold hover:bg-gold/5"
      }`}
    >
      {pending && <Spinner size="sm" />}
      {isAdmin ? "取消管理员" : "设为管理员"}
    </button>
  );
}
