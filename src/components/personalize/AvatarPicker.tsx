"use client";

import { useState } from "react";
import { AVATAR_BY_ID, AVATAR_CATEGORIES, AVATARS } from "@/avatars/avatars";
import { Avatar } from "../Avatar";
import { onGridKeyDown } from "./roving";

type Cat = (typeof AVATAR_CATEGORIES)[number]["id"];

export function AvatarPicker({ value, name, onChange }: { value: string | null; name: string; onChange: (id: string | null) => void }) {
  const initialCat = (value && AVATAR_BY_ID.get(value)?.category) || "faces";
  const [cat, setCat] = useState<Cat>(initialCat);
  const list = AVATARS.filter((a) => a.category === cat);
  const focusIndex = Math.max(0, list.findIndex((a) => a.id === value));

  const surprise = () => {
    const pool = AVATARS.filter((a) => a.id !== value);
    const a = pool[Math.floor(Math.random() * pool.length)];
    setCat(a.category);
    onChange(a.id);
  };

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="segmented" role="tablist" aria-label="סוג אווטר">
          {AVATAR_CATEGORIES.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="row">
          <button type="button" className="btn ghost small-btn" onClick={surprise}>
            🎲 הפתיעי אותי
          </button>
          {value && (
            <button type="button" className="btn ghost small-btn" onClick={() => onChange(null)}>
              בלי אווטר
            </button>
          )}
        </div>
      </div>

      <div className="avatar-grid" role="radiogroup" aria-label="בחירת אווטר" onKeyDown={(e) => onGridKeyDown(e, (i) => onChange(list[i].id))}>
        {list.map((a, i) => {
          const selected = a.id === value;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={a.label}
              title={a.label}
              tabIndex={i === focusIndex ? 0 : -1}
              data-roving
              className="avatar-opt"
              onClick={() => onChange(a.id)}
            >
              <Avatar id={a.id} size={56} />
              {selected && (
                <span className="check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!value && (
        <p className="muted small" style={{ margin: 0 }}>
          {name ? `בלי אווטר תוצג האות ״${[...name.trim()][0] ?? ""}״.` : "בלי אווטר ובלי שם יוצג סמל כללי."}
        </p>
      )}
    </div>
  );
}
