"use client";

import { staffAssignableNavItems } from "@/lib/admin-nav";
import type { AdminDictionary } from "@/lib/i18n/admin";

// Staff 权限勾选清单，AddUserForm(新建账号)和 UserRoleEditor(改现有账号)共用，
// 复选框本身带 name="permissions"，AddUserForm 的原生 <form> 提交能直接读到勾选结果。
export function PermissionChecklist({
  selected,
  onChange,
  navDict,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  navDict: AdminDictionary["sidebar"]["nav"];
}) {
  function toggle(key: string) {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {staffAssignableNavItems.map((item) => (
        <label key={item.key} className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name="permissions"
            value={item.key}
            checked={selected.includes(item.key)}
            onChange={() => toggle(item.key)}
          />
          {navDict[item.key] ?? item.label}
        </label>
      ))}
    </div>
  );
}
