"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createGender } from "./actions";

export function AddGenderForm() {
  const [state, formAction, pending] = useActionState(
    createGender,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          分区名称
        </label>
        <input
          name="label"
          required
          placeholder="e.g. Kids"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          Slug（留空自动生成）
        </label>
        <input
          name="slug"
          placeholder="kids"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">排序</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={0}
          className="w-20 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "添加中" : "+ 添加分区"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
