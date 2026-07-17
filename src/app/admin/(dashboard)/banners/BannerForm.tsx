"use client";

import Image from "next/image";
import { useActionState } from "react";
import { createBanner, updateBanner } from "./actions";
import { Spinner } from "@/components/ui/Spinner";
import type { Banner } from "@/lib/banners";
import type { AdminDictionary } from "@/lib/i18n/admin";

const cardClass =
  "rounded-2xl border border-border-subtle bg-background p-6 shadow-sm";
const labelClass =
  "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";
const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm outline-none focus:border-gold";

// datetime-local 需要 "YYYY-MM-DDTHH:mm" 本地时间格式；
// 数据库存的是 ISO UTC，这里转成输入框能吃的本地格式
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 不传 banner 是新增，传了就是编辑
export function BannerForm({
  banner,
  dict,
  common,
}: {
  banner?: Banner;
  dict: AdminDictionary["pages"]["banners"];
  common: AdminDictionary["common"];
}) {
  const action = banner ? updateBanner.bind(null, banner.id) : createBanner;
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = state?.values;
  const f = dict.form;

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className={cardClass}>
        <label className={labelClass}>
          {f.imageLabel} {banner ? f.imageKeepCurrent : "*"}
        </label>
        {banner?.imageUrl && (
          <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl border border-border-subtle">
            <Image
              src={banner.imageUrl}
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
          className="block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background"
        />
        <p className="mt-2 text-xs text-foreground/40">
          {f.imageHint}
        </p>
      </div>

      <div className={cardClass}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{f.titleLabel}</label>
            <input
              name="title"
              className={inputClass}
              defaultValue={v ? v.title : banner?.title}
              placeholder="Summer Collection"
            />
          </div>
          <div>
            <label className={labelClass}>{f.subtitleLabel}</label>
            <input
              name="subtitle"
              className={inputClass}
              defaultValue={v ? v.subtitle : banner?.subtitle}
              placeholder="Limited time offer, up to 50% off"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{f.linkUrlLabel}</label>
              <input
                name="linkUrl"
                className={inputClass}
                defaultValue={v ? v.linkUrl : banner?.linkUrl}
                placeholder="/promotion"
              />
            </div>
            <div>
              <label className={labelClass}>{f.linkTextLabel}</label>
              <input
                name="linkText"
                className={inputClass}
                defaultValue={v ? v.linkText : banner?.linkText}
                placeholder="Shop Now"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{f.sortOrderLabel}</label>
              <input
                name="sortOrder"
                type="number"
                className={inputClass}
                defaultValue={v ? v.sortOrder : (banner?.sortOrder ?? 0)}
              />
            </div>
            <label className="flex items-center gap-3 self-end pb-3 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={v ? v.isActive : (banner?.isActive ?? true)}
                className="h-5 w-5 accent-foreground"
              />
              {f.activeLabel}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{f.startsAtLabel}</label>
              <input
                name="startsAt"
                type="datetime-local"
                className={inputClass}
                defaultValue={v ? v.startsAt : toLocalInput(banner?.startsAt)}
              />
            </div>
            <div>
              <label className={labelClass}>{f.endsAtLabel}</label>
              <input
                name="endsAt"
                type="datetime-local"
                className={inputClass}
                defaultValue={v ? v.endsAt : toLocalInput(banner?.endsAt)}
              />
            </div>
          </div>
          <p className="text-xs text-foreground/40">
            {f.scheduleHint}
          </p>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? common.saving : banner ? f.saveButton : f.createButton}
      </button>
    </form>
  );
}
