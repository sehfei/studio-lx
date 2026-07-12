"use client";

import Image from "next/image";
import { useActionState } from "react";
import { createBanner, updateBanner } from "./actions";
import { Spinner } from "@/components/ui/Spinner";
import type { Banner } from "@/lib/banners";

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
export function BannerForm({ banner }: { banner?: Banner }) {
  const action = banner ? updateBanner.bind(null, banner.id) : createBanner;
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = state?.values;

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className={cardClass}>
        <label className={labelClass}>
          Banner 图片 {banner ? "（不选则保留当前图）" : "*"}
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
          建议宽幅横图，JPEG/PNG/WEBP，最大 5MB。
        </p>
      </div>

      <div className={cardClass}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>标题（可选）</label>
            <input
              name="title"
              className={inputClass}
              defaultValue={v ? v.title : banner?.title}
              placeholder="Summer Collection"
            />
          </div>
          <div>
            <label className={labelClass}>副标题（可选）</label>
            <input
              name="subtitle"
              className={inputClass}
              defaultValue={v ? v.subtitle : banner?.subtitle}
              placeholder="限时优惠，全场低至五折"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>按钮链接（可选）</label>
              <input
                name="linkUrl"
                className={inputClass}
                defaultValue={v ? v.linkUrl : banner?.linkUrl}
                placeholder="/promotion"
              />
            </div>
            <div>
              <label className={labelClass}>按钮文字（可选）</label>
              <input
                name="linkText"
                className={inputClass}
                defaultValue={v ? v.linkText : banner?.linkText}
                placeholder="立即选购"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>排序（数字小的排前面）</label>
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
              启用（显示在首页）
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>开始时间（可选）</label>
              <input
                name="startsAt"
                type="datetime-local"
                className={inputClass}
                defaultValue={v ? v.startsAt : toLocalInput(banner?.startsAt)}
              />
            </div>
            <div>
              <label className={labelClass}>结束时间（可选）</label>
              <input
                name="endsAt"
                type="datetime-local"
                className={inputClass}
                defaultValue={v ? v.endsAt : toLocalInput(banner?.endsAt)}
              />
            </div>
          </div>
          <p className="text-xs text-foreground/40">
            留空表示不限时间。填了时间则只在时间窗内显示。
          </p>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "保存中" : banner ? "保存修改" : "创建 Banner"}
      </button>
    </form>
  );
}
