"use client";

import { useActionState, useState, useTransition } from "react";
import {
  BUTTON_SIZE_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  buttonSizeVars,
  buttonStyleVars,
  DEFAULT_THEME,
  DENSITY_OPTIONS,
  FONT_PRESETS,
  RADIUS_OPTIONS,
  THEME_PRESETS,
  type ThemeSettings,
} from "@/lib/theme";
import { Spinner } from "@/components/ui/Spinner";
import type { AdminDictionary } from "@/lib/i18n/admin";
import { saveTheme, undoLastSave } from "./actions";

type SettingsDict = AdminDictionary["settings"];

// 颜色字段的显示名从词典取（dict.colorLabels[key]），这里只保留 key 顺序。
const COLOR_KEYS: (keyof ThemeSettings["colors"])[] = [
  "background",
  "foreground",
  "primary",
  "accent",
  "border",
  "muted",
  "destructive",
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// 后台编辑器自己的外壳样式是固定的现代风格（圆角卡片 + 轻阴影），
// 不跟随客户端网站的 --radius 设置——那是网站访客看到的东西，
// 后台工具本身该长什么样是独立的决定。
const cardClass =
  "rounded-2xl border border-border-subtle bg-background p-6 shadow-sm";
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

// 分段式单选控件：用于圆角/间距/按钮风格这类少量选项的单选
function Segmented<T extends string | number>({
  options,
  value,
  name,
  onChange,
  renderLabel,
}: {
  options: readonly T[];
  value: T;
  name: string;
  onChange: (v: T) => void;
  renderLabel: (v: T) => React.ReactNode;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-border-subtle bg-foreground/3 p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <label
            key={String(opt)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors ${
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={active}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {renderLabel(opt)}
          </label>
        );
      })}
    </div>
  );
}

export function ThemeForm({
  initial,
  dict,
}: {
  initial: ThemeSettings;
  dict: SettingsDict;
}) {
  const [theme, setTheme] = useState<ThemeSettings>(initial);
  const [state, formAction, pending] = useActionState(saveTheme, undefined);
  const [undoState, setUndoState] = useState<
    { error?: string; success?: string } | undefined
  >(undefined);
  const [undoPending, startUndo] = useTransition();

  const handleUndo = () => {
    startUndo(async () => {
      const result = await undoLastSave();
      setUndoState(result);
      // 撤销后数据库变了，但表单里的未保存修改不受影响；
      // 如果用户没有正在编辑，直接跟着刷新页面看最新结果最省心
      if (result?.success) {
        window.location.reload();
      }
    });
  };

  const setColor = (key: keyof ThemeSettings["colors"], value: string) =>
    setTheme((t) => ({ ...t, colors: { ...t.colors, [key]: value } }));

  const font =
    FONT_PRESETS.find((f) => f.id === theme.fontPreset) ?? FONT_PRESETS[0];
  const density =
    DENSITY_OPTIONS.find((d) => d.id === theme.density) ?? DENSITY_OPTIONS[1];

  // 预览容器：把当前选择的变量作用在预览区域内
  const previewVars = {
    "--background": theme.colors.background,
    "--foreground": theme.colors.foreground,
    "--primary": theme.colors.primary,
    "--gold": theme.colors.accent,
    "--border-subtle": theme.colors.border,
    "--muted": theme.colors.muted,
    "--destructive": theme.colors.destructive,
    "--radius": `${theme.radius}px`,
    "--spacing-scale": density.spacing,
    "--font-display-active": `var(${font.displayVar})`,
    "--font-sans-active": `var(${font.sansVar})`,
    ...buttonStyleVars(theme.buttonStyle),
    ...buttonSizeVars(theme.buttonSize),
  } as React.CSSProperties;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
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
          <SectionHeading>{dict.quickPalette}</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={dict.themePresets[preset.id] ?? preset.label}
                onClick={() =>
                  setTheme((t) => ({ ...t, colors: preset.colors }))
                }
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border-subtle p-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
              >
                <span className="flex">
                  <span
                    className="h-8 w-8 rounded-full border-2 border-background shadow-sm"
                    style={{ background: preset.colors.background }}
                  />
                  <span
                    className="-ml-3 h-8 w-8 rounded-full border-2 border-background shadow-sm"
                    style={{ background: preset.colors.primary }}
                  />
                  <span
                    className="-ml-3 h-8 w-8 rounded-full border-2 border-background shadow-sm"
                    style={{ background: preset.colors.accent }}
                  />
                </span>
                <span className="text-xs font-medium text-foreground/80 group-hover:text-gold">
                  {dict.themePresets[preset.id] ?? preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <SectionHeading>{dict.colors}</SectionHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COLOR_KEYS.map((key) => {
              const label = dict.colorLabels[key];
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3 transition-shadow hover:shadow-sm"
                >
                  <label className="relative shrink-0 cursor-pointer">
                    <span
                      className="block h-10 w-10 rounded-full border border-border-subtle shadow-sm"
                      style={{ background: theme.colors[key] }}
                    />
                    <input
                      type="color"
                      name={`color-${key}`}
                      value={theme.colors[key]}
                      onChange={(e) => setColor(key, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label={label}
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <input
                      type="text"
                      key={theme.colors[key]}
                      defaultValue={theme.colors[key]}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        if (HEX_RE.test(v)) setColor(key, v);
                      }}
                      className="mt-0.5 w-full border-0 bg-transparent p-0 font-mono text-xs text-foreground/50 outline-none focus:text-gold"
                      aria-label={`${label} ${dict.hexAria}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cardClass}>
          <SectionHeading>{dict.fontCombo}</SectionHeading>
          <select
            id="fontPreset"
            name="fontPreset"
            value={theme.fontPreset}
            onChange={(e) =>
              setTheme((t) => ({
                ...t,
                fontPreset: e.target.value as ThemeSettings["fontPreset"],
              }))
            }
            className="w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          >
            {FONT_PRESETS.map((f) => (
              <option key={f.id} value={f.id}>
                {dict.fontPresets[f.id] ?? f.label}
              </option>
            ))}
          </select>
        </div>

        <div className={cardClass}>
          <SectionHeading>{dict.radius}</SectionHeading>
          <div className="flex flex-wrap gap-3">
            {RADIUS_OPTIONS.map((r) => {
              const active = theme.radius === r;
              return (
                <label
                  key={r}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors ${
                    active
                      ? "border-gold bg-gold/5"
                      : "border-border-subtle hover:border-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="radius"
                    value={r}
                    checked={active}
                    onChange={() => setTheme((t) => ({ ...t, radius: r }))}
                    className="sr-only"
                  />
                  <span
                    className="h-8 w-8 border-2 border-foreground/40"
                    style={{ borderRadius: `${r}px` }}
                    aria-hidden
                  />
                  <span className="text-xs">
                    {r === 0 ? dict.radiusStraight : `${r}px`}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={cardClass}>
          <SectionHeading>{dict.density}</SectionHeading>
          <Segmented
            name="density"
            options={DENSITY_OPTIONS.map((d) => d.id)}
            value={theme.density}
            onChange={(v) => setTheme((t) => ({ ...t, density: v }))}
            renderLabel={(v) => dict.densityLabels[v] ?? v}
          />
        </div>

        <div className={cardClass}>
          <SectionHeading>{dict.buttonStyle}</SectionHeading>
          <Segmented
            name="buttonStyle"
            options={BUTTON_STYLE_OPTIONS.map((b) => b.id)}
            value={theme.buttonStyle}
            onChange={(v) => setTheme((t) => ({ ...t, buttonStyle: v }))}
            renderLabel={(v) => dict.buttonStyles[v] ?? v}
          />
        </div>

        <div className={cardClass}>
          <SectionHeading>{dict.buttonSize}</SectionHeading>
          <Segmented
            name="buttonSize"
            options={BUTTON_SIZE_OPTIONS.map((b) => b.id)}
            value={theme.buttonSize}
            onChange={(v) => setTheme((t) => ({ ...t, buttonSize: v }))}
            renderLabel={(v) => dict.buttonSizes[v] ?? v}
          />
        </div>

        {undoState?.error && (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {undoState.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending && <Spinner size="sm" />}
            {pending ? dict.saving : dict.save}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => setTheme(initial)}
          >
            {dict.discard}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => setTheme(DEFAULT_THEME)}
          >
            {dict.restoreDefault}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={handleUndo}
            disabled={undoPending}
          >
            {undoPending && <Spinner size="sm" />}
            {undoPending ? dict.undoing : dict.undo}
          </button>
        </div>
      </form>

      <div className="lg:sticky lg:top-8">
        <div className="rounded-2xl border border-border-subtle p-2 shadow-sm">
          <p className="px-4 pt-3 pb-2 text-xs font-medium tracking-widest text-foreground/50 uppercase">
            {dict.livePreview}
          </p>
          <div
            style={previewVars}
            className="space-y-6 rounded-xl bg-background p-6 text-foreground"
          >
            <p className="eyebrow">STUDIO LX</p>
            <h2 className="section-title">{dict.previewTitle}</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {dict.previewBody}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gold">RM 690.00</span>
              <span className="line-through" style={{ color: "var(--muted)" }}>
                RM 890.00
              </span>
              <span
                className="bg-gold px-1.5 py-0.5 text-xs font-medium"
                style={{
                  color: "var(--background)",
                  borderRadius: "var(--radius)",
                }}
              >
                -22%
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="btn-primary">{dict.previewPrimaryBtn}</span>
              <span className="btn-outline">{dict.previewOutlineBtn}</span>
              <button type="button" className="btn-primary" disabled>
                <Spinner size="sm" />
                {dict.previewLoading}
              </button>
            </div>
            <div
              className="border border-border-subtle p-4"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="text-sm">{dict.previewCard}</p>
            </div>
            <p className="text-xs" style={{ color: "var(--destructive)" }}>
              {dict.previewError}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
