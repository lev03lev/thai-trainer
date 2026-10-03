"use client";

import { THEMES, type Theme, type ThemeChoice } from "@/themes/themes";
import { onGridKeyDown } from "./roving";

/** תצוגה מקדימה זעירה: [data-theme] על האלמנט מחיל עליו את צבעי הערכה בלבד */
function MiniPreview({ theme }: { theme: string }) {
  return (
    <div className="tp-mini" data-theme={theme} aria-hidden="true">
      <div className="tp-bar">
        <span className="tp-dot" />
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

const OPTIONS: { id: ThemeChoice; name: string; description: string; theme?: Theme }[] = [
  { id: "system", name: "לפי המכשיר", description: "קלאסי ביום, לילה חם בלילה — אוטומטית" },
  ...THEMES.map((t) => ({ id: t.id, name: t.name, description: t.description, theme: t })),
];

export function ThemePicker({ value, onChange }: { value: ThemeChoice; onChange: (t: ThemeChoice) => void }) {
  return (
    <div className="theme-grid" role="radiogroup" aria-label="ערכת עיצוב" onKeyDown={(e) => onGridKeyDown(e, (i) => onChange(OPTIONS[i].id))}>
      {OPTIONS.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-roving
            className="theme-card"
            onClick={() => onChange(o.id)}
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
                {o.theme && <span className="tc-scheme">{o.theme.scheme === "dark" ? "כהה" : "בהיר"}</span>}
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
  );
}
