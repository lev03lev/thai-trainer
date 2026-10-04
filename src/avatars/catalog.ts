// קטלוג האווטרים — נתונים בלבד (בלי ציור), כדי שיהיה קל וזמין בכל עמוד.
// הציור עצמו: avatars.tsx (איורי SVG שלנו) ו-dicebear.ts (נטען בעצלתיים).

/** אווטר מעוצב אישית (Avatar Builder). כל ערך הוא מזהה אפשרות של סגנון avataaars, או "none". */
export interface AvatarConfig {
  skinColor: string;
  top: string;
  hairColor: string;
  hatColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  facialHair: string;
  facialHairColor: string;
  accessories: string;
  accessoriesColor: string;
  clothing: string;
  clothesColor: string;
  clothingGraphic: string;
  /** צבע רקע אחד, או שניים מופרדים במקף (גרדיאנט) */
  background: string;
}

export const CUSTOM_AVATAR_ID = "custom";

export const CONFIG_KEYS: (keyof AvatarConfig)[] = [
  "skinColor", "top", "hairColor", "hatColor", "eyes", "eyebrows", "mouth", "facialHair", "facialHairColor",
  "accessories", "accessoriesColor", "clothing", "clothesColor", "clothingGraphic", "background",
];

export type GalleryStyle = "avataaars" | "bottts" | "lorelei" | "notionists" | "pixelArt";

export interface GalleryAvatar {
  id: string;
  label: string;
  category: string;
  style: GalleryStyle;
  seed: string;
  bg: string;
  /** לדמויות avataaars: ההגדרה המלאה — אפשר לפתוח אותה בעורך ולהמשיך לעצב */
  config?: AvatarConfig;
}

/** קטגוריות הגלריה, לפי סדר התצוגה */
export const CATEGORIES = [
  { id: "people", label: "דמויות" },
  { id: "faces", label: "פרצופונים" },
  { id: "sketch", label: "איורי קו" },
  { id: "pixel", label: "פיקסל" },
  { id: "robots", label: "רובוטים" },
  { id: "food", label: "מהמטבח" },
] as const;

const BGS = [
  "ffd5dc", "ffdfbf", "fff1a8", "c0f2d0", "b6e3f4", "d1d4f9", "e6d6ff", "f6d365-fda085",
  "a1c4fd-c2e9fb", "84fab0-8fd3f4", "fbc2eb-a6c1ee", "fccb90-d57eeb",
];

// ---------- דמויות avataaars: מגוון גווני עור, שיער, כיסויי ראש, משקפיים וזקנים ----------
const SKIN = ["ffdbb4", "edb98a", "d08b5b", "ae5d29", "614335", "fd9841", "f8d25c"];
const TOPS = [
  "longButNotTooLong", "shortFlat", "hijab", "curly", "bob", "theCaesar", "bun", "fro", "straight01", "shortWaved",
  "turban", "miaWallace", "dreads", "frizzle", "winterHat02", "bigHair", "shavedSides", "curvy", "shortCurly", "froBand",
  "hat", "straightAndStrand", "sides", "shaggy",
];
const HAIR = ["2c1b18", "4a312c", "a55728", "b58143", "d6b370", "724133", "c93305", "e8e1e1", "f59797", "ecdcbf"];
const EYES = ["happy", "default", "wink", "squint", "side", "hearts"];
const MOUTH = ["smile", "default", "twinkle", "smile", "tongue", "serious"];
const BROWS = ["defaultNatural", "raisedExcitedNatural", "default", "flatNatural"];
const CLOTHES = ["hoodie", "blazerAndShirt", "shirtCrewNeck", "collarAndSweater", "graphicShirt", "overall", "shirtVNeck", "blazerAndSweater", "shirtScoopNeck"];
const CLOTH_COLORS = ["ff5c5c", "65c9ff", "a7ffc4", "ffffb1", "ff488e", "25557c", "262e33", "ffafb9", "5199e4", "e6e6e6"];
const HAT_COLORS = ["ff488e", "65c9ff", "25557c", "a7ffc4", "ffffb1"];
const GRAPHICS = ["pizza", "bear", "diamond", "hola", "deer", "cumbia"];

const PEOPLE: GalleryAvatar[] = TOPS.map((top, i) => {
  const config: AvatarConfig = {
    skinColor: SKIN[i % SKIN.length],
    top,
    hairColor: HAIR[(i * 3) % HAIR.length],
    hatColor: HAT_COLORS[i % HAT_COLORS.length],
    eyes: EYES[i % EYES.length],
    eyebrows: BROWS[i % BROWS.length],
    mouth: MOUTH[(i * 5) % MOUTH.length],
    facialHair: [1, 5, 12, 16].includes(i) ? ["beardLight", "beardMedium", "moustacheFancy", "beardMajestic"][[1, 5, 12, 16].indexOf(i)] : "none",
    facialHairColor: HAIR[(i * 3) % HAIR.length],
    accessories: [0, 6, 9, 13, 19].includes(i) ? ["round", "prescription02", "wayfarers", "kurt", "prescription01"][[0, 6, 9, 13, 19].indexOf(i)] : "none",
    accessoriesColor: "262e33",
    clothing: CLOTHES[i % CLOTHES.length],
    clothesColor: CLOTH_COLORS[(i * 7) % CLOTH_COLORS.length],
    clothingGraphic: GRAPHICS[i % GRAPHICS.length],
    background: BGS[(i * 5) % BGS.length],
  };
  return { id: `person-${String(i + 1).padStart(2, "0")}`, label: `דמות ${i + 1}`, category: "people", style: "avataaars", seed: "", bg: config.background, config };
});

function seeded(style: GalleryStyle, category: string, label: string, prefix: string, seeds: string[]): GalleryAvatar[] {
  return seeds.map((seed, i) => ({
    id: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    label: `${label} ${i + 1}`,
    category,
    style,
    seed,
    bg: BGS[(i * 7 + 3) % BGS.length],
  }));
}

const SEEDS = ["Mango", "Lime", "Basil", "Lotus", "Coconut", "Chili", "Tamarind", "Ginger", "Jasmine", "Pepper", "Lemongrass", "Peanut", "Galangal", "Papaya"];

export const GALLERY: GalleryAvatar[] = [
  ...PEOPLE,
  ...seeded("lorelei", "sketch", "איור", "sketch", SEEDS.slice(0, 12)),
  ...seeded("notionists", "sketch", "רישום", "notion", SEEDS.slice(2, 14)),
  ...seeded("pixelArt", "pixel", "פיקסל", "pixel", SEEDS.slice(0, 14)),
  ...seeded("bottts", "robots", "רובוט", "robot", SEEDS.slice(0, 14)),
];

export const GALLERY_IDS = new Set(GALLERY.map((g) => g.id));
