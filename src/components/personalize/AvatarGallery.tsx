"use client";

import { useState } from "react";
import { AVATARS } from "@/avatars/avatars";
import { CATEGORIES, GALLERY, type AvatarConfig } from "@/avatars/catalog";
import { Avatar } from "../Avatar";
import { onGridKeyDown } from "./roving";

type Cat = (typeof CATEGORIES)[number]["id"];

interface Item {
  id: string;
  label: string;
  config?: AvatarConfig;
}

function itemsOf(cat: Cat): Item[] {
  if (cat === "faces" || cat === "food") return AVATARS.filter((a) => a.category === cat).map((a) => ({ id: a.id, label: a.label }));
  return GALLERY.filter((g) => g.category === cat).map((g) => ({ id: g.id, label: g.label, config: g.config }));
}

function categoryOf(id: string | null): Cat {
  if (!id) return "people";
  const svg = AVATARS.find((a) => a.id === id);
  if (svg) return svg.category as Cat;
  return (GALLERY.find((g) => g.id === id)?.category as Cat) ?? "people";
}

export function AvatarGallery({
  value,
  onChange,
  onCustomize,
}: {
  value: string | null;
  onChange: (id: string) => void;
  /** פתיחת דמות מהגלריה בעורך, כנקודת התחלה */
  onCustomize: (config: AvatarConfig) => void;
}) {
  const [cat, setCat] = useState<Cat>(() => categoryOf(value));
  const list = itemsOf(cat);
  const focusIndex = Math.max(0, list.findIndex((a) => a.id === value));
  const selected = list.find((a) => a.id === value);

  return (
    <div className="stack">
      <div className="chips" role="tablist" aria-label="סוג אווטר">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" className="chip" aria-selected={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
            <span className="count">{itemsOf(c.id).length}</span>
          </button>
        ))}
      </div>

      <div className="avatar-grid" role="radiogroup" aria-label="בחירת אווטר" onKeyDown={(e) => onGridKeyDown(e, (i) => onChange(list[i].id))}>
        {list.map((a, i) => {
          const isSel = a.id === value;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              aria-label={a.label}
              title={a.label}
              tabIndex={i === focusIndex ? 0 : -1}
              data-roving
              className="avatar-opt"
              onClick={() => onChange(a.id)}
            >
              <Avatar id={a.id} size={60} />
              {isSel && (
                <span className="check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected?.config && (
        <button type="button" className="btn ghost small-btn" style={{ alignSelf: "start" }} onClick={() => onCustomize(selected.config!)}>
          ✏️ לעצב את הדמות הזו בעורך
        </button>
      )}
    </div>
  );
}
