// אווטרים מבוססי DiceBear (נוצרים כ-SVG בדפדפן, בלי רשת).
// סגנונות בשימוש — כולם ללא חובת ייחוס:
//   avataaars, bottts — Pablo Stanley, "Free for personal and commercial use"
//   lorelei, notionists, pixelArt — CC0 1.0
// המודול כבד יחסית, ולכן נטען בעצלתיים (dynamic import) מחוץ לעמוד ההתאמה האישית.

import { createAvatar, type Style } from "@dicebear/core";
import { avataaars, bottts, lorelei, notionists, pixelArt } from "@dicebear/collection";
import { GALLERY, type AvatarConfig, type GalleryStyle } from "./catalog";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STYLES: Record<GalleryStyle, Style<any>> = { avataaars, bottts, lorelei, notionists, pixelArt };

const enumOf = (key: string): string[] => (avataaars.schema.properties as any)[key]?.items?.enum ?? [];
const colorsOf = (key: string): string[] => (avataaars.schema.properties as any)[key]?.default ?? [];
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- חלקי ה-Avatar Builder (מונחה נתונים: להוספת חלק מוסיפים רשומה) ----------
export const HAT_TOPS = ["hat", "hijab", "turban", "winterHat1", "winterHat02", "winterHat03", "winterHat04"];
const EXCLUDE: Record<string, string[]> = {
  mouth: ["vomit", "screamOpen"],
  clothingGraphic: ["skull", "skullOutline", "resist", "bat"],
};

/** רקעים: צבע אחד או שניים (גרדיאנט) */
export const BACKGROUNDS: string[][] = [
  ["ffd5dc"], ["ffdfbf"], ["fff1a8"], ["c0f2d0"], ["b6e3f4"], ["d1d4f9"], ["e6d6ff"], ["f1f1f1"],
  ["ff9a8b", "ffd3a5"], ["f6d365", "fda085"], ["a1c4fd", "c2e9fb"], ["84fab0", "8fd3f4"],
  ["fbc2eb", "a6c1ee"], ["fccb90", "d57eeb"], ["43e97b", "38f9d7"], ["30cfd0", "6a3093"],
  ["1e3c72", "2a5298"], ["232526", "414345"],
];

export type PartKind = "shape" | "color" | "background";
export interface PartDef {
  key: keyof AvatarConfig;
  label: string;
  kind: PartKind;
  options: string[];
  /** אפשר לבחור "בלי" (למשל בלי זקן) */
  none?: boolean;
  showIf?: (c: AvatarConfig) => boolean;
}

export interface PartGroup {
  id: string;
  label: string;
  icon: string;
  parts: PartDef[];
}

export const PART_GROUPS: PartGroup[] = [
  {
    id: "face",
    label: "פנים",
    icon: "🙂",
    parts: [
      { key: "skinColor", label: "צבע עור", kind: "color", options: colorsOf("skinColor") },
      { key: "eyes", label: "עיניים", kind: "shape", options: enumOf("eyes") },
      { key: "eyebrows", label: "גבות", kind: "shape", options: enumOf("eyebrows") },
      { key: "mouth", label: "פה", kind: "shape", options: enumOf("mouth").filter((x) => !EXCLUDE.mouth.includes(x)) },
    ],
  },
  {
    id: "hair",
    label: "שיער",
    icon: "💇",
    parts: [
      { key: "top", label: "תסרוקת / כיסוי ראש", kind: "shape", options: enumOf("top"), none: true },
      { key: "hairColor", label: "צבע שיער", kind: "color", options: colorsOf("hairColor"), showIf: (c) => c.top !== "none" && !HAT_TOPS.includes(c.top) },
      { key: "hatColor", label: "צבע כיסוי הראש", kind: "color", options: colorsOf("hatColor"), showIf: (c) => HAT_TOPS.includes(c.top) },
    ],
  },
  {
    id: "beard",
    label: "זקן ושפם",
    icon: "🧔",
    parts: [
      { key: "facialHair", label: "זקן / שפם", kind: "shape", options: enumOf("facialHair"), none: true },
      { key: "facialHairColor", label: "צבע", kind: "color", options: colorsOf("facialHairColor"), showIf: (c) => c.facialHair !== "none" },
    ],
  },
  {
    id: "glasses",
    label: "משקפיים",
    icon: "👓",
    parts: [
      { key: "accessories", label: "משקפיים ואביזרים", kind: "shape", options: enumOf("accessories"), none: true },
      { key: "accessoriesColor", label: "צבע המסגרת", kind: "color", options: colorsOf("accessoriesColor"), showIf: (c) => c.accessories !== "none" },
    ],
  },
  {
    id: "clothes",
    label: "בגדים",
    icon: "👕",
    parts: [
      { key: "clothing", label: "בגד", kind: "shape", options: enumOf("clothing") },
      { key: "clothesColor", label: "צבע הבגד", kind: "color", options: colorsOf("clothesColor") },
      {
        key: "clothingGraphic",
        label: "הדפס על החולצה",
        kind: "shape",
        options: enumOf("clothingGraphic").filter((x) => !EXCLUDE.clothingGraphic.includes(x)),
        showIf: (c) => c.clothing === "graphicShirt",
      },
    ],
  },
  {
    id: "bg",
    label: "רקע",
    icon: "🎨",
    parts: [{ key: "background", label: "רקע", kind: "background", options: BACKGROUNDS.map((b) => b.join("-")) }],
  },
];

export const ALL_PARTS = PART_GROUPS.flatMap((g) => g.parts);

export const DEFAULT_CONFIG: AvatarConfig = {
  skinColor: "edb98a",
  top: "shortWaved",
  hairColor: "2c1b18",
  hatColor: "ff488e",
  eyes: "happy",
  eyebrows: "defaultNatural",
  mouth: "smile",
  facialHair: "none",
  facialHairColor: "2c1b18",
  accessories: "none",
  accessoriesColor: "262e33",
  clothing: "hoodie",
  clothesColor: "ff5c5c",
  clothingGraphic: "pizza",
  background: "f6d365-fda085",
};

/** ערכים לא מוכרים (גרסה ישנה, נתונים פגומים) מוחלפים בברירת המחדל */
export function sanitizeConfig(input: unknown): AvatarConfig {
  const out = { ...DEFAULT_CONFIG };
  if (!input || typeof input !== "object") return out;
  const raw = input as Record<string, unknown>;
  for (const p of ALL_PARTS) {
    const v = raw[p.key];
    if (typeof v === "string" && (p.options.includes(v) || (p.none && v === "none"))) out[p.key] = v;
  }
  return out;
}

const FRIENDLY = {
  eyes: ["default", "happy", "wink", "squint", "side", "hearts", "surprised"],
  mouth: ["smile", "default", "twinkle", "tongue", "serious"],
  eyebrows: ["defaultNatural", "raisedExcitedNatural", "default", "raisedExcited", "flatNatural"],
};

/** אווטר אקראי "נחמד" (בלי הבעות מוזרות) */
export function randomConfig(rand: () => number = Math.random): AvatarConfig {
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
  const c = { ...DEFAULT_CONFIG };
  for (const p of ALL_PARTS) {
    const opts = (FRIENDLY as Record<string, string[]>)[p.key] ?? p.options;
    c[p.key] = p.none && rand() < 0.55 ? "none" : pick(opts);
  }
  return c;
}

// ---------- ציור ----------
// הערכים כבר עברו sanitizeConfig מול רשימות האפשרויות של הסגנון, ולכן ההמרה לטיפוס בטוחה
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function avataaarsOptions(c: AvatarConfig): any {
  const bg = c.background.split("-");
  return {
    style: ["circle"],
    skinColor: [c.skinColor],
    top: c.top === "none" ? [] : [c.top],
    topProbability: c.top === "none" ? 0 : 100,
    hairColor: [c.hairColor],
    hatColor: [c.hatColor],
    eyes: [c.eyes],
    eyebrows: [c.eyebrows],
    mouth: [c.mouth],
    facialHair: c.facialHair === "none" ? [] : [c.facialHair],
    facialHairProbability: c.facialHair === "none" ? 0 : 100,
    facialHairColor: [c.facialHairColor],
    accessories: c.accessories === "none" ? [] : [c.accessories],
    accessoriesProbability: c.accessories === "none" ? 0 : 100,
    accessoriesColor: [c.accessoriesColor],
    clothing: [c.clothing],
    clothesColor: [c.clothesColor],
    clothingGraphic: [c.clothingGraphic],
    backgroundColor: bg,
    backgroundType: [bg.length > 1 ? "gradientLinear" : "solid"],
    backgroundRotation: [135],
  };
}

const cache = new Map<string, string>();
const memo = (key: string, make: () => string) => {
  let v = cache.get(key);
  if (!v) {
    v = make();
    if (cache.size > 800) cache.clear();
    cache.set(key, v);
  }
  return v;
};

/** אווטר מעוצב אישית → data URI של SVG */
export function renderConfig(input: AvatarConfig): string {
  const c = sanitizeConfig(input);
  return memo(`c:${JSON.stringify(c)}`, () => createAvatar(avataaars, avataaarsOptions(c)).toDataUri());
}

/** אווטר מהגלריה (DiceBear) → data URI, או null אם המזהה לא שייך לגלריה */
export function renderGallery(id: string): string | null {
  const g = GALLERY.find((x) => x.id === id);
  if (!g) return null;
  return memo(`g:${id}`, () => {
    if (g.style === "avataaars" && g.config) return renderConfig(g.config);
    const bg = g.bg.split("-");
    return createAvatar(STYLES[g.style], {
      seed: g.seed,
      radius: 50,
      backgroundColor: bg,
      backgroundType: [bg.length > 1 ? "gradientLinear" : "solid"],
      backgroundRotation: [135],
    }).toDataUri();
  });
}
