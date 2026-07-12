"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { SiteIdentity } from "@/lib/identity";
import { Spinner } from "@/components/ui/Spinner";
import { saveIdentity } from "./actions";

const cardClass =
  "rounded-2xl border border-border-subtle bg-background p-6 shadow-sm";
const labelClass =
  "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";
const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm outline-none focus:border-gold";
const sectionLabelClass =
  "mb-4 flex items-center gap-2 text-xs font-medium tracking-widest text-foreground/50 uppercase";
const dotClass = "h-1.5 w-1.5 shrink-0 rounded-full bg-gold";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className={sectionLabelClass}>
      <span className={dotClass} aria-hidden />
      {children}
    </p>
  );
}

function AssetUploader({
  label,
  hint,
  currentUrl,
  fileName,
  removeName,
  accept,
  previewClassName,
}: {
  label: string;
  hint: string;
  currentUrl?: string;
  fileName: string;
  removeName: string;
  accept: string;
  previewClassName: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-subtle p-4">
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden border border-border-subtle bg-foreground/3 ${previewClassName}`}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={label}
            width={64}
            height={64}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <span className="text-[10px] text-foreground/30">无</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-medium">{label}</p>
        <p className="mb-2 text-xs text-foreground/40">{hint}</p>
        <input
          type="file"
          name={fileName}
          accept={accept}
          className="block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background"
        />
        {currentUrl && (
          <label className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <input type="checkbox" name={removeName} className="h-3.5 w-3.5" />
            删除当前图片
          </label>
        )}
      </div>
    </div>
  );
}

export function IdentityForm({ initial }: { initial: SiteIdentity }) {
  const [state, formAction, pending] = useActionState(
    saveIdentity,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-2xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">
          {state.success}
        </p>
      )}

      <div className={cardClass}>
        <SectionHeading>品牌图片</SectionHeading>
        <div className="space-y-3">
          <AssetUploader
            label="Logo"
            hint="导航栏和页脚会用到，留空则显示网站名称文字"
            currentUrl={initial.logoUrl}
            fileName="logoFile"
            removeName="removeLogo"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            previewClassName="h-16 w-32 rounded-xl"
          />
          <AssetUploader
            label="Favicon（浏览器标签页图标）"
            hint="建议正方形图片，PNG 或 ICO"
            currentUrl={initial.faviconUrl}
            fileName="faviconFile"
            removeName="removeFavicon"
            accept="image/png,image/x-icon,image/vnd.microsoft.icon"
            previewClassName="h-12 w-12 rounded-full"
          />
          <AssetUploader
            label="首页 Hero 图片"
            hint="首页最顶部的大图，留空则显示占位背景"
            currentUrl={initial.heroImageUrl}
            fileName="heroFile"
            removeName="removeHero"
            accept="image/png,image/jpeg,image/webp"
            previewClassName="h-16 w-28 rounded-xl"
          />
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeading>联系方式</SectionHeading>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>WhatsApp 号码（含国家代码，纯数字）</label>
            <input
              name="whatsappNumber"
              defaultValue={initial.whatsappNumber}
              placeholder="60123456789"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Instagram 链接</label>
              <input
                name="instagramUrl"
                defaultValue={initial.instagramUrl}
                placeholder="https://instagram.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Facebook 链接</label>
              <input
                name="facebookUrl"
                defaultValue={initial.facebookUrl}
                placeholder="https://facebook.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>TikTok 链接</label>
              <input
                name="tiktokUrl"
                defaultValue={initial.tiktokUrl}
                placeholder="https://tiktok.com/@..."
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeading>访问统计</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Google Analytics ID</label>
            <input
              name="gaId"
              defaultValue={initial.gaId}
              placeholder="G-XXXXXXXXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta Pixel ID</label>
            <input
              name="metaPixelId"
              defaultValue={initial.metaPixelId}
              placeholder="123456789012345"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "保存中" : "保存并全站生效"}
      </button>
    </form>
  );
}
