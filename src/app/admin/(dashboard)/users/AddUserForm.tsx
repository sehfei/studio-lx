"use client";

import { useActionState, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createBackendUser, type UserRole } from "./actions";
import { PermissionChecklist } from "./PermissionChecklist";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function AddUserForm({
  navDict,
}: {
  navDict: AdminDictionary["sidebar"]["nav"];
}) {
  const [state, formAction, pending] = useActionState(
    createBackendUser,
    undefined,
  );
  // 新建账号时角色/权限就一步选好，不做"先建空账号再回来补权限"，
  // 避免账号建好后忘记授权、晾在那里既登录不进任何页面又没人发现的中间态。
  const [role, setRole] = useState<UserRole>("staff");
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">邮箱</label>
        <input
          name="email"
          type="email"
          required
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">初始密码</label>
        <input
          name="password"
          type="text"
          required
          minLength={6}
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">角色</label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "创建中" : "+ 添加账号"}
      </button>

      {role === "staff" && (
        <div className="w-full">
          <p className="mb-1 text-xs text-foreground/50">权限清单</p>
          <PermissionChecklist
            selected={permissions}
            onChange={setPermissions}
            navDict={navDict}
          />
        </div>
      )}

      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full text-sm text-gold">{state.success}</p>
      )}
    </form>
  );
}
