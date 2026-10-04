"use client";

import { useState } from "react";
import type { AvatarConfig } from "@/avatars/catalog";
import { DEFAULT_CONFIG, PART_GROUPS, randomConfig, renderConfig, type PartDef } from "@/avatars/dicebear";

/** איזה אזור באווטר להגדיל בתמונות הממוזערות (כדי שיראו את הפרט שמשנים) */
const ZOOM: Partial<Record<keyof AvatarConfig, string>> = {
  eyes: "zoom-eyes",
  eyebrows: "zoom-eyes",
  mouth: "zoom-mouth",
  facialHair: "zoom-mouth",
  accessories: "zoom-eyes",
  top: "zoom-top",
  clothing: "zoom-body",
  clothingGraphic: "zoom-body",
};

const swatch = (opt: string) => {
  const c = opt.split("-").map((x) => `#${x}`);
  return c.length > 1 ? `linear-gradient(135deg, ${c[0]}, ${c[1]})` : c[0];
};

function Part({ part, config, set }: { part: PartDef; config: AvatarConfig; set: (k: keyof AvatarConfig, v: string) => void }) {
  const value = config[part.key];
  const options = part.none ? ["none", ...part.options] : part.options;
  const name = (o: string, i: number) => (o === "none" ? "בלי" : `${part.label} ${part.none ? i : i + 1}`);

  if (part.kind === "shape") {
    return (
      <fieldset className="part-set">
        <legend>{part.label}</legend>
        <div className="shape-grid" role="radiogroup" aria-label={part.label}>
          {options.map((o, i) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={value === o}
              aria-label={name(o, i)}
              title={name(o, i)}
              className="shape-opt"
              onClick={() => set(part.key, o)}
            >
              {o === "none" ? (
                <span className="none-mark" aria-hidden="true">
                  ⌀
                </span>
              ) : (
                <span className={`thumb ${ZOOM[part.key] ?? ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={renderConfig({ ...config, [part.key]: o })} alt="" loading="lazy" draggable={false} />
                </span>
              )}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="part-set">
      <legend>{part.label}</legend>
      <div className="swatches" role="radiogroup" aria-label={part.label}>
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            aria-label={`${part.label} ${i + 1}`}
            title={`${part.label} ${i + 1}`}
            className={`swatch ${part.kind === "background" ? "wide" : ""}`}
            style={{ background: swatch(o) }}
            onClick={() => set(part.key, o)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function AvatarBuilder({ config, onChange }: { config: AvatarConfig; onChange: (c: AvatarConfig) => void }) {
  const [group, setGroup] = useState(PART_GROUPS[0].id);
  const [history, setHistory] = useState<AvatarConfig[]>([]);
  const current = PART_GROUPS.find((g) => g.id === group)!;

  const apply = (next: AvatarConfig) => {
    setHistory((h) => [...h.slice(-29), config]);
    onChange(next);
  };
  const set = (k: keyof AvatarConfig, v: string) => apply({ ...config, [k]: v });

  return (
    <div className="builder">
      <div className="builder-tabs" role="tablist" aria-label="חלקי האווטר">
        {PART_GROUPS.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={group === g.id} onClick={() => setGroup(g.id)}>
            <span className="tab-icon" aria-hidden="true">
              {g.icon}
            </span>
            {g.label}
          </button>
        ))}
      </div>

      <div className="builder-panel" role="tabpanel" aria-label={current.label}>
        {current.parts
          .filter((p) => !p.showIf || p.showIf(config))
          .map((p) => (
            <Part key={p.key} part={p} config={config} set={set} />
          ))}
      </div>

      <div className="row builder-actions">
        <button type="button" className="btn ghost small-btn" onClick={() => apply(randomConfig())}>
          🎲 אקראי
        </button>
        <button
          type="button"
          className="btn ghost small-btn"
          disabled={!history.length}
          onClick={() => {
            const prev = history[history.length - 1];
            setHistory((h) => h.slice(0, -1));
            onChange(prev);
          }}
        >
          ↶ ביטול פעולה
        </button>
        <button type="button" className="btn ghost small-btn" onClick={() => apply(DEFAULT_CONFIG)}>
          איפוס העיצוב
        </button>
      </div>
    </div>
  );
}
