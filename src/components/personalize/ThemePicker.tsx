"use client";

import { useState, type MouseEvent } from "react";
import { THEMES, type Theme, type ThemeChoice } from "@/themes/themes";
import { onGridKeyDown } from "./roving";

/** תצוגה מקדימה זעירה: [data-theme] על האלמנט מחיל עליו את כל "האופי" של הערכה */
function MiniPreview({ theme }: { theme: string }) {
  return (
    <div className="tp-mini" data-theme={theme} aria-hidden="true">
      <div className="tp-bar">
        <span className="tp-dot" />
        <span className="tp-title">אבג</span>
        <span className="tp-line short" />
      </div>
      <div className="tp-card">
        <span className="tp-line" />
        <span className="tp-line mid" />
        <div className="tp-row">
          <span className="tp-btn" />
          <span className="tp-chip ok" />
          <span className="tp-chip bad" />
        </div>
      </div>
    </div>
  );
}

interface Option {
  id: ThemeChoice;
  name: string;
  description: string;
  theme?: Theme;
}

const OPTIONS: Option[] = [
  { id: "system", name: "לפי המכשיר", description: "קלאסי ביום, לילה חם בלילה — אוטומטית" },
  ...THEMES.map((t) => ({ id: t.id, name: t.name, description: t.description, theme: t })),
];

const FILTERS = [
  { id: "all", label: "הכול" },
  { id: "light", label: "בהירות" },
  { id: "dark", label: "כהות" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

export function ThemePicker({
  value,
  onChange,
  onPreview,
}: {
  value: ThemeChoice;
  onChange: (t: ThemeChoice, origin?: { x: number; y: number }) => void;
  /** ריחוף / פוקוס על ערכה — לתצוגה מקדימה לפני בחירה (null = סיום) */
  onPreview?: (t: ThemeChoice | null) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const list = OPTIONS.filter((o) => filter === "all" || o.id === "system" || o.theme?.scheme === filter);
  const origin = (e: MouseEvent) => (e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined);

  return (
    <div className="stack">
      <div className="segmented" role="tablist" aria-label="סינון ערכות">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span className="count">{f.id === "all" ? THEMES.length : THEMES.filter((t) => t.scheme === f.id).length}</span>
          </button>
        ))}
      </div>
      <div
        className="theme-grid"
        role="radiogroup"
        aria-label="ערכת עיצוב"
        onKeyDown={(e) => onGridKeyDown(e, (i) => onChange(list[i].id))}
        onMouseLeave={() => onPreview?.(null)}
      >
        {list.map((o) => {
          const selected = value === o.id;
          const tabbable = selected || (!list.some((x) => x.id === value) && o === list[0]);
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              data-roving
              className="theme-card"
              onClick={(e) => onChange(o.id, origin(e))}
              onMouseEnter={() => onPreview?.(o.id)}
              onFocus={() => onPreview?.(o.id)}
              onBlur={() => onPreview?.(null)}
            >
              {o.id === "system" ? (
                <div className="tp-split">
                  <MiniPreview theme="light" />
                  <MiniPreview theme="dark" />
                </div>
              ) : (
                <MiniPreview theme={o.id} />
              )}
              <span className="tc-text">
                <span className="tc-name">
                  {o.name}
                  {o.theme && <span className="tc-scheme">{o.theme.vibe}</span>}
                </span>
                <span className="tc-desc">{o.description}</span>
              </span>
              {selected && (
                <span className="check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
