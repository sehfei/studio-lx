"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createSubcategory } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

export function AddSubcategoryForm({
  category,
  dict,
  common,
}: {
  category: string;
  dict: AdminDictionary["pages"]["subcategories"];
  common: AdminDictionary["common"];
}) {
  const [state, formAction, pending] = useActionState(
    createSubcategory,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="category" value={category} />
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {dict.nameLabel}
        </label>
        <input
          name="label"
          required
          placeholder="e.g. MIUMIU"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {common.slugHint}
        </label>
        <input
          name="slug"
          placeholder="miumiu"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {common.sort}
        </label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={0}
          className="w-20 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? common.adding : dict.addButton}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
