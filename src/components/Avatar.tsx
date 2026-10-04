"use client";

import { useEffect, useState } from "react";
import { AVATAR_BY_ID } from "@/avatars/avatars";
import { CUSTOM_AVATAR_ID, GALLERY, GALLERY_IDS, type AvatarConfig } from "@/avatars/catalog";
import { initialOf } from "@/lib/preferences/model";

// מודול DiceBear נטען פעם אחת, רק כשבאמת צריך אותו
type Dice = typeof import("@/avatars/dicebear");
let dicePromise: Promise<Dice> | null = null;
let dice: Dice | null = null;
const loadDice = () => (dicePromise ??= import("@/avatars/dicebear").then((m) => (dice = m)));

function uriFor(m: Dice, id: string, custom?: AvatarConfig | null): string | null {
  if (id === CUSTOM_AVATAR_ID) return custom ? m.renderConfig(custom) : null;
  return m.renderGallery(id);
}

function DiceAvatar({ id, custom, size, className, label }: { id: string; custom?: AvatarConfig | null; size: number; className: string; label: string }) {
  const [uri, setUri] = useState<string | null>(() => (dice ? uriFor(dice, id, custom) : null));
  useEffect(() => {
    let alive = true;
    loadDice().then((m) => alive && setUri(uriFor(m, id, custom)));
    return () => {
      alive = false;
    };
  }, [id, custom]);
  const style = { width: size, height: size };
  if (!uri) return <span className={`avatar skeleton ${className}`} style={style} aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`avatar ${className}`} style={style} src={uri} alt={label} draggable={false} />;
}

export function Avatar({
  id,
  custom,
  name = "",
  size = 40,
  className = "",
}: {
  id: string | null;
  /** הגדרת האווטר המעוצב (כש-id === "custom") */
  custom?: AvatarConfig | null;
  name?: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };
  const def = id ? AVATAR_BY_ID.get(id) : undefined;
  if (def) {
    return (
      <svg className={`avatar ${className}`} style={style} viewBox="0 0 80 80" role="img" aria-label={def.label}>
        {def.art}
      </svg>
    );
  }
  if (id && (GALLERY_IDS.has(id) || (id === CUSTOM_AVATAR_ID && custom))) {
    const label = id === CUSTOM_AVATAR_ID ? "אווטר בעיצוב אישי" : (GALLERY.find((g) => g.id === id)?.label ?? "אווטר");
    return <DiceAvatar id={id} custom={custom} size={size} className={className} label={label} />;
  }
  const initial = initialOf(name);
  return (
    <span className={`avatar avatar-fallback ${className}`} style={{ ...style, fontSize: size * 0.45 }} aria-hidden="true">
      {initial || (
        <svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
        </svg>
      )}
    </span>
  );
}
