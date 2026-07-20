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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!announcement.enabled || !announcement.message) return;
    // Instagram/WhatsApp 等 App 内置浏览器、Safari 无痕模式等环境下
    // localStorage 可能直接抛错，抛错就当没关闭过，正常显示公告
    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    } catch {
      dismissedAt = 0;
    }
    // 服务端渲染时读不到 localStorage，只能在客户端挂载后再决定是否显示；
    // 内容更新时间比顾客关闭时间新，说明是新公告，重新显示
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(dismissedAt >= announcement.updatedAt);
  }, [announcement.enabled, announcement.message, announcement.updatedAt]);

  if (!announcement.enabled || !announcement.message || dismissed) {
    return null;
  }

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // 存不了就算了，这次访问关掉就好，下次再看到也不影响功能
    }
    setDismissed(true);
  };

  const content = (
    <span className="mx-8 inline-flex shrink-0 items-center gap-3 whitespace-nowrap">
      <span>{announcement.message}</span>
      {announcement.linkUrl && announcement.linkText && (
        <a
          href={announcement.linkUrl}
          className="underline underline-offset-2 hover:text-gold"
        >
          {announcement.linkText}
        </a>
      )}
    </span>
  );

  return (
    <div className="relative flex min-h-11 items-center overflow-hidden bg-foreground px-10 py-2 text-xs tracking-wide text-background sm:text-sm">
      {reducedMotion ? (
        <div className="flex flex-1 items-center justify-center text-center">
          {content}
        </div>
      ) : (
        <div className="flex w-max animate-marquee">
          {content}
          {content}
        </div>
      )}
      <button
        type="button"
        onClick={close}
        aria-label={closeLabel}
        className="absolute right-2 flex h-8 w-8 shrink-0 items-center justify-center bg-foreground text-background/70 hover:text-background"
      >
        ✕
      </button>
    </div>
  );
}
