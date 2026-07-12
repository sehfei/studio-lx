"use client";

import { useActionState } from "react";
import type { AnnouncementSettings } from "@/lib/announcement";
import { Spinner } from "@/components/ui/Spinner";
import { saveAnnouncement } from "./actions";

// 和 ThemeForm 一致：后台表单外壳用固定的现代圆角风格，
// 不跟随网站自己的 --radius 设置（那是给访客看的，不是给后台工具看的）。
const cardClass =
  "rounded-2xl border border-border-subtle bg-background p-6 shadow-sm";
const labelClass =
  "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";
const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm outline-none focus:border-gold";

export function AnnouncementForm({
  initial,
}: {
  initial: AnnouncementSettings;
}) {
  const [state, formAction, pending] = useActionState(
    saveAnnouncement,
    undefined,
  );

  return (
    <form action={formAction} className={`max-w-xl space-y-5 ${cardClass}`}>
      {state?.error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">
          {state.success}
        </p>
      )}

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border-subtle px-4 text-sm">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initial.enabled}
          className="h-5 w-5 accent-foreground"
        />
        在网站顶部显示公告
      </label>

      <div>
        <label className={labelClass}>公告内容</label>
        <textarea
          name="message"
          rows={2}
          maxLength={200}
          defaultValue={initial.message}
          placeholder="例如：全场满 RM200 免运费，限时到本月底"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>按钮链接（可选）</label>
          <input
            name="linkUrl"
            defaultValue={initial.linkUrl}
            placeholder="/promotion"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>按钮文字（可选）</label>
          <input
            name="linkText"
            defaultValue={initial.linkText}
            placeholder="立即选购"
            className={inputClass}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? "保存中" : "保存并全站生效"}
      </button>
    </form>
  );
}
