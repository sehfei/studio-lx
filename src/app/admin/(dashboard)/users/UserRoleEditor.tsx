"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { setUserRole, type UserRole } from "./actions";
import { PermissionChecklist } from "./PermissionChecklist";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function UserRoleEditor({
  userId,
  role: initialRole,
  permissions: initialPermissions,
  isSelf,
  navDict,
}: {
  userId: string;
  role: UserRole;
  permissions: string[];
  isSelf: boolean;
  navDict: AdminDictionary["sidebar"]["nav"];
}) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);
  const [pending, startTransition] = useTransition();

  // 自己这一行整个禁用，服务端 setUserRole 也有"不能降级最后一个管理员"的保护，
  // 这里在前端多一层直观提示，不让店主手滑把自己踢出后台。
  if (isSelf) {
    return <span className="text-xs text-foreground/30">不能修改自己</span>;
  }

  const dirty =
    role !== initialRole ||
    permissions.slice().sort().join(",") !==
      initialPermissions.slice().sort().join(",");

  function save() {
    if (
      initialRole === "admin" &&
      role !== "admin" &&
      !confirm("确定取消这个账号的管理员权限？")
    ) {
      return;
    }
    startTransition(async () => {
      const result = await setUserRole(userId, role, permissions);
      if (result?.error) alert(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <select
        value={role}
        disabled={pending}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="border border-border-subtle bg-background px-2 py-1 text-xs outline-none focus:border-gold"
      >
        <option value="customer">Customer</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>

      {role === "staff" && (
        <PermissionChecklist
          selected={permissions}
          onChange={setPermissions}
          navDict={navDict}
        />
      )}

      {dirty && (
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="inline-flex items-center gap-1.5 border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/5"
        >
          {pending && <Spinner size="sm" />}
          保存
        </button>
      )}
    </div>
  );
}
