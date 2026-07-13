"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createAdminUser } from "./actions";

export function AddAdminForm() {
  const [state, formAction, pending] = useActionState(
    createAdminUser,
    undefined,
  );

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
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "创建中" : "+ 添加管理员"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full text-sm text-gold">{state.success}</p>
      )}
    </form>
  );
}
