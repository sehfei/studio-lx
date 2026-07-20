"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { createGender, updateGender } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";
import type { GenderRow } from "@/lib/genders";

// 不传 gender 是新增，传了就是编辑（slug 编辑时不让改）
export function AddGenderForm({
  gender,
  dict,
  common,
}: {
  gender?: GenderRow;
  dict: AdminDictionary["pages"]["genders"];
  common: AdminDictionary["common"];
}) {
  const action = gender
    ? updateGender.bind(null, gender.id)
    : createGender;
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
          defaultValue={gender?.label}
          placeholder="e.g. Kids"
          className="border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      {!gender && (
        <div>
          <label className="mb-1 block text-xs text-foreground/50">
            {common.slugHint}
          </label>
          <input
            name="slug"
            placeholder="kids"
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
          defaultValue={gender?.sort_order ?? 0}
          className="w-20 border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="w-full">
        <label className="mb-1 block text-xs text-foreground/50">
          {dict.imageLabel}
        </label>
        {gender?.image_url && (
          <div className="relative mb-2 h-20 w-28 overflow-hidden border border-border-subtle">
            <Image
              src={gender.image_url}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="block text-xs file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background"
        />
        <p className="mt-1 text-xs text-foreground/40">{dict.imageHint}</p>
        {gender?.image_url && (
          <label className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
            <input type="checkbox" name="removeImage" className="h-3.5 w-3.5" />
            {dict.removeCurrentImage}
          </label>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending
          ? gender
            ? common.saving
            : common.adding
          : gender
            ? common.save
            : dict.addButton}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
