"use client";

import { useEffect, useState } from "react";
import type { AnnouncementSettings } from "@/lib/announcement";

const STORAGE_KEY = "announcement-dismissed-at";

export function AnnouncementBar({
  announcement,
  closeLabel = "Close",
}: {
  announcement: AnnouncementSettings;
  closeLabel?: string;
}) {
  const [dismissed, setDismissed] = useState(true); // 首屏先不显示，避免闪烁

  useEffect(() => {
    if (!announcement.enabled || !announcement.message) return;
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    // 服务端渲染时读不到 localStorage，只能在客户端挂载后再决定是否显示；
    // 内容更新时间比顾客关闭时间新，说明是新公告，重新显示
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(dismissedAt >= announcement.updatedAt);
  }, [announcement.enabled, announcement.message, announcement.updatedAt]);

  if (!announcement.enabled || !announcement.message || dismissed) {
    return null;
  }

  const close = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <div className="relative flex min-h-11 items-center justify-center gap-3 bg-foreground px-10 py-2 text-center text-xs tracking-wide text-background sm:text-sm">
      <span>{announcement.message}</span>
      {announcement.linkUrl && announcement.linkText && (
        <a
          href={announcement.linkUrl}
          className="shrink-0 underline underline-offset-2 hover:text-gold"
        >
          {announcement.linkText}
        </a>
      )}
      <button
        type="button"
        onClick={close}
        aria-label={closeLabel}
        className="absolute right-2 flex h-8 w-8 shrink-0 items-center justify-center text-background/70 hover:text-background"
      >
        ✕
      </button>
    </div>
  );
}
