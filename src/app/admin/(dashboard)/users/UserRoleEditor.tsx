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
  dict,
  common,
}: {
  userId: string;
  role: UserRole;
  permissions: string[];
  isSelf: boolean;
  navDict: AdminDictionary["sidebar"]["nav"];
  dict: AdminDictionary["pages"]["users"];
  common: AdminDictionary["common"];
}) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);
  const [pending, startTransition] = useTransition();

  // 自己这一行整个禁用，服务端 setUserRole 也有"不能降级最后一个管理员"的保护，
  // 这里在前端多一层直观提示，不让店主手滑把自己踢出后台。
  if (isSelf) {
    return (
      <span className="text-xs text-foreground/30">
        {common.cannotEditSelf}
      </span>
    );
  }

  const dirty =
    role !== initialRole ||
    permissions.slice().sort().join(",") !==
      initialPermissions.slice().sort().join(",");

  function save() {
    if (
      initialRole === "admin" &&
      role !== "admin" &&
      !confirm(dict.confirmRemoveAdmin)
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
        <option value="customer">{dict.roleCustomer}</option>
        <option value="staff">{dict.roleStaff.replace(" ({n})", "")}</option>
        <option value="admin">{dict.roleAdmin}</option>
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
          {dict.save}
        </button>
      )}
    </div>
  );
}
