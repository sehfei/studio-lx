"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createSubcategory, updateSubcategory } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";
import type { SubcategoryRow } from "@/lib/subcategories";
import type { GenderRow } from "@/lib/genders";

// 不传 subcategory 是新增，传了就是编辑（slug 和所属分类编辑时不让改）
export function AddSubcategoryForm({
  category,
  subcategory,
  genders,
  dict,
  common,
}: {
  category: string;
  subcategory?: SubcategoryRow;
  genders: GenderRow[];
  dict: AdminDictionary["pages"]["subcategories"];
  common: AdminDictionary["common"];
}) {
  const action = subcategory
    ? updateSubcategory.bind(null, subcategory.id)
    : createSubcategory;
  const [state, formAction, pending] = useActionState(action, undefined);

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
          defaultValue={subcategory?.label}
          placeholder="e.g. MIUMIU"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      {!subcategory && (
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
      )}
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {common.sort}
        </label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={subcategory?.sort_order ?? 0}
          className="w-20 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div className="w-full">
        <p className="mb-1.5 text-xs text-foreground/50">
          {dict.gendersLabel}
        </p>
        <div className="flex flex-wrap gap-3">
          {genders.map((g) => (
            <label key={g.id} className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                name="genders"
                value={g.slug}
                defaultChecked={subcategory?.genders.includes(g.slug)}
              />
              {g.label}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending
          ? subcategory
            ? common.saving
            : common.adding
          : subcategory
            ? common.save
            : dict.addButton}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
