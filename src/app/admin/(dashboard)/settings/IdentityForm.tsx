"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { SiteIdentity } from "@/lib/identity";
import { Spinner } from "@/components/ui/Spinner";
import { saveIdentity } from "./actions";
import type { AdminDictionary } from "@/lib/i18n/admin";

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
  noneText,
  removeCurrentImageText,
}: {
  label: string;
  hint: string;
  currentUrl?: string;
  fileName: string;
  removeName: string;
  accept: string;
  previewClassName: string;
  noneText: string;
  removeCurrentImageText: string;
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
          <span className="text-[10px] text-foreground/30">{noneText}</span>
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
            {removeCurrentImageText}
          </label>
        )}
      </div>
    </div>
  );
}

export function IdentityForm({
  initial,
  dict,
  common,
}: {
  initial: SiteIdentity;
  dict: AdminDictionary["settings"]["identityForm"];
  common: AdminDictionary["common"];
}) {
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
        <SectionHeading>{dict.brandImagesHeading}</SectionHeading>
        <div className="space-y-3">
          <AssetUploader
            label={dict.logoLabel}
            hint={dict.logoHint}
            currentUrl={initial.logoUrl}
            fileName="logoFile"
            removeName="removeLogo"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            previewClassName="h-16 w-32 rounded-xl"
            noneText={dict.none}
            removeCurrentImageText={dict.removeCurrentImage}
          />
          <AssetUploader
            label={dict.faviconLabel}
            hint={dict.faviconHint}
            currentUrl={initial.faviconUrl}
            fileName="faviconFile"
            removeName="removeFavicon"
            accept="image/png,image/x-icon,image/vnd.microsoft.icon"
            previewClassName="h-12 w-12 rounded-full"
            noneText={dict.none}
            removeCurrentImageText={dict.removeCurrentImage}
          />
          <AssetUploader
            label={dict.heroLabel}
            hint={dict.heroHint}
            currentUrl={initial.heroImageUrl}
            fileName="heroFile"
            removeName="removeHero"
            accept="image/png,image/jpeg,image/webp"
            previewClassName="h-16 w-28 rounded-xl"
            noneText={dict.none}
            removeCurrentImageText={dict.removeCurrentImage}
          />
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeading>{dict.contactHeading}</SectionHeading>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>{dict.whatsappLabel}</label>
            <input
              name="whatsappNumber"
              defaultValue={initial.whatsappNumber}
              placeholder="60123456789"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{dict.instagramLabel}</label>
              <input
                name="instagramUrl"
                defaultValue={initial.instagramUrl}
                placeholder="https://instagram.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{dict.facebookLabel}</label>
              <input
                name="facebookUrl"
                defaultValue={initial.facebookUrl}
                placeholder="https://facebook.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{dict.tiktokLabel}</label>
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
        <SectionHeading>{dict.analyticsHeading}</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{dict.gaIdLabel}</label>
            <input
              name="gaId"
              defaultValue={initial.gaId}
              placeholder="G-XXXXXXXXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.metaPixelIdLabel}</label>
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
        {pending ? common.saving : dict.saveButton}
      </button>
    </form>
  );
}
