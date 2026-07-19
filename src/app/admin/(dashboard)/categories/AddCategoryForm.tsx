"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createCategory, updateCategory } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";
import type { CategoryRow } from "@/lib/categories";
import type { GenderRow } from "@/lib/genders";

// 不传 category 是新增，传了就是编辑（slug 编辑时不让改，products/subcategories 都用 slug 引用）
export function AddCategoryForm({
  category,
  genders,
  dict,
  common,
}: {
  category?: CategoryRow;
  genders: GenderRow[];
  dict: AdminDictionary["pages"]["categories"];
  common: AdminDictionary["common"];
}) {
  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-foreground/50">
          {dict.nameLabel}
        </label>
        <input
          name="label"
          required
          defaultValue={category?.label}
          placeholder="e.g. Hats"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      {!category && (
        <div>
          <label className="mb-1 block text-xs text-foreground/50">
            {common.slugHint}
          </label>
          <input
            name="slug"
            placeholder="hats"
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
          defaultValue={category?.sort_order ?? 0}
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
                defaultChecked={category?.genders.includes(g.slug)}
              />
              {g.label}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending
          ? category
            ? common.saving
            : common.adding
          : category
            ? common.save
            : dict.addButton}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
