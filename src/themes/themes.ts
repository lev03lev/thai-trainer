// ערכות עיצוב (Themes). כל ערכה מוגדרת פעם אחת כאן, וה-CSS נוצר ממנה אוטומטית.
// כדי להוסיף ערכה: מוסיפים אובייקט ל-THEMES. בדיקת הניגודיות (tests/themes.test.ts)
// תבדוק אותה אוטומטית.

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  /** צבע הטקסט על כפתור ראשי */
  accentInk: string;
  accentSoft: string;
  /** צבע משני לקישוטים (גרדיאנטים) */
  accent2: string;
  ok: string;
  okSoft: string;
  bad: string;
  badSoft: string;
  warn: string;
  warnSoft: string;
  focus: string;
  /** רקע מאחורי איורי המנות הסרוקים (אפור על לבן) */
  imgBg: string;
  shadow: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  scheme: "light" | "dark";
  tokens: ThemeTokens;
}

const SHADOW_LIGHT = "0 1px 2px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.05)";
const SHADOW_DARK = "0 1px 2px rgb(0 0 0 / 0.35), 0 8px 24px rgb(0 0 0 / 0.25)";

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "קלאסי",
    description: "קרם חמים וטרקוטה — העיצוב המקורי",
    scheme: "light",
    tokens: {
      bg: "#fbf8f3",
      surface: "#ffffff",
      surface2: "#f3eee6",
      text: "#1f1a14",
      muted: "#62584c",
      border: "#e2d9cc",
      accent: "#b2451f",
      accentInk: "#ffffff",
      accentSoft: "#fbe9e1",
      accent2: "#d98b2b",
      ok: "#1e6b3a",
      okSoft: "#e3f3e8",
      bad: "#a8261c",
      badSoft: "#fbe6e4",
      warn: "#7a4d00",
      warnSoft: "#fff1d6",
      focus: "#1b5fd1",
      imgBg: "#ffffff",
      shadow: SHADOW_LIGHT,
    },
  },
  {
    id: "dark",
    name: "לילה חם",
    description: "כהה ונעים לעיניים, עם נגיעות כתומות",
    scheme: "dark",
    tokens: {
      bg: "#17130f",
      surface: "#221c16",
      surface2: "#2c251d",
      text: "#f3ece2",
      muted: "#bfb3a3",
      border: "#3d342a",
      accent: "#f08a5d",
      accentInk: "#1b120c",
      accentSoft: "#3a2419",
      accent2: "#e7b85c",
      ok: "#7fd49a",
      okSoft: "#173222",
      bad: "#ff8f84",
      badSoft: "#3b1a17",
      warn: "#ffcc6e",
      warnSoft: "#3a2c10",
      focus: "#8ab4ff",
      imgBg: "#efe9e0",
      shadow: SHADOW_DARK,
    },
  },
  {
    id: "midnight",
    name: "חצות",
    description: "כחול לילה עמוק עם תכלת קריר",
    scheme: "dark",
    tokens: {
      bg: "#0b1020",
      surface: "#121a2f",
      surface2: "#1a2440",
      text: "#e8ecf8",
      muted: "#a6b1cd",
      border: "#29355a",
      accent: "#8ab4ff",
      accentInk: "#0b1020",
      accentSoft: "#1c2b50",
      accent2: "#b39dff",
      ok: "#6ee7a8",
      okSoft: "#11301f",
      bad: "#ff8f8f",
      badSoft: "#3a1621",
      warn: "#ffd479",
      warnSoft: "#33290f",
      focus: "#ffd479",
      imgBg: "#e9edf5",
      shadow: SHADOW_DARK,
    },
  },
  {
    id: "ocean",
    name: "אוקיינוס",
    description: "בהיר ומרענן — כחול ים וטורקיז",
    scheme: "light",
    tokens: {
      bg: "#f1f7fa",
      surface: "#ffffff",
      surface2: "#e2eef4",
      text: "#0d2430",
      muted: "#465f6c",
      border: "#cddfe8",
      accent: "#0a6c94",
      accentInk: "#ffffff",
      accentSoft: "#dbeff8",
      accent2: "#14a3a3",
      ok: "#1d6b45",
      okSoft: "#e0f3e9",
      bad: "#b0282b",
      badSoft: "#fbe5e5",
      warn: "#7a4d00",
      warnSoft: "#fff1d6",
      focus: "#c2410c",
      imgBg: "#ffffff",
      shadow: SHADOW_LIGHT,
    },
  },
  {
    id: "forest",
    name: "יער",
    description: "ירוק מרווה טבעי ורגוע",
    scheme: "light",
    tokens: {
      bg: "#f2f5ef",
      surface: "#fbfcf9",
      surface2: "#e5ebde",
      text: "#18241b",
      muted: "#4c5c4f",
      border: "#d1dbc9",
      accent: "#2d6a3d",
      accentInk: "#ffffff",
      accentSoft: "#dfeddd",
      accent2: "#a07a22",
      ok: "#22633a",
      okSoft: "#ddefe1",
      bad: "#a3311f",
      badSoft: "#f8e3de",
      warn: "#6b4900",
      warnSoft: "#f6ead0",
      focus: "#1b5fd1",
      imgBg: "#ffffff",
      shadow: SHADOW_LIGHT,
    },
  },
  {
    id: "neon",
    name: "ניאון",
    description: "סגול לילי עם ורוד וציאן זוהרים",
    scheme: "dark",
    tokens: {
      bg: "#120b1f",
      surface: "#1b1230",
      surface2: "#251a40",
      text: "#f3eaff",
      muted: "#bcabda",
      border: "#3a2c60",
      accent: "#ee82fa",
      accentInk: "#1b0b24",
      accentSoft: "#3a1d4c",
      accent2: "#22d3ee",
      ok: "#5eead4",
      okSoft: "#0f2f2c",
      bad: "#fb7f93",
      badSoft: "#3b1425",
      warn: "#fde047",
      warnSoft: "#33300c",
      focus: "#22d3ee",
      imgBg: "#ece6f5",
      shadow: SHADOW_DARK,
    },
  },
  {
    id: "gold",
    name: "זהב תאילנדי",
    description: "שחור פחם וזהב — אווירת מקדש בלילה",
    scheme: "dark",
    tokens: {
      bg: "#14110b",
      surface: "#1e1910",
      surface2: "#2a2316",
      text: "#f5ecd8",
      muted: "#c4b596",
      border: "#3d3420",
      accent: "#e6b450",
      accentInk: "#1a1307",
      accentSoft: "#392d12",
      accent2: "#e0703a",
      ok: "#8fd694",
      okSoft: "#18301a",
      bad: "#ff8f7f",
      badSoft: "#3b1a14",
      warn: "#ffd27a",
      warnSoft: "#382b0f",
      focus: "#8ab4ff",
      imgBg: "#f1ebdf",
      shadow: SHADOW_DARK,
    },
  },
  {
    id: "lotus",
    name: "לוטוס",
    description: "ורוד פרחוני עדין עם שזיף עמוק",
    scheme: "light",
    tokens: {
      bg: "#fbf5f8",
      surface: "#ffffff",
      surface2: "#f3e6ee",
      text: "#2a1421",
      muted: "#694a5c",
      border: "#ead3df",
      accent: "#a3266f",
      accentInk: "#ffffff",
      accentSoft: "#f8e0ed",
      accent2: "#6d3fd1",
      ok: "#1e6b3a",
      okSoft: "#e3f3e8",
      bad: "#ad2128",
      badSoft: "#fbe4e6",
      warn: "#7a4d00",
      warnSoft: "#fff0d9",
      focus: "#1b5fd1",
      imgBg: "#ffffff",
      shadow: SHADOW_LIGHT,
    },
  },
  {
    id: "contrast",
    name: "ניגודיות גבוהה",
    description: "שחור, לבן וצהוב — הכי קריא שיש",
    scheme: "dark",
    tokens: {
      bg: "#000000",
      surface: "#000000",
      surface2: "#1a1a1a",
      text: "#ffffff",
      muted: "#e6e6e6",
      border: "#ffffff",
      accent: "#ffe500",
      accentInk: "#000000",
      accentSoft: "#2b2600",
      accent2: "#00e5ff",
      ok: "#3dff8a",
      okSoft: "#002a12",
      bad: "#ff7a7a",
      badSoft: "#2e0000",
      warn: "#ffe500",
      warnSoft: "#262100",
      focus: "#00e5ff",
      imgBg: "#ffffff",
      shadow: "none",
    },
  },
];

export type ThemeId = string;
/** "system" = לפי הגדרת המכשיר (קלאסי ביום, לילה חם בלילה) */
export type ThemeChoice = ThemeId | "system";

export const DEFAULT_LIGHT = "light";
export const DEFAULT_DARK = "dark";
export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]));

const VAR: Record<keyof ThemeTokens, string> = {
  bg: "--bg",
  surface: "--surface",
  surface2: "--surface-2",
  text: "--text",
  muted: "--muted",
  border: "--border",
  accent: "--accent",
  accentInk: "--accent-ink",
  accentSoft: "--accent-soft",
  accent2: "--accent-2",
  ok: "--ok",
  okSoft: "--ok-soft",
  bad: "--bad",
  badSoft: "--bad-soft",
  warn: "--warn",
  warnSoft: "--warn-soft",
  focus: "--focus",
  imgBg: "--img-bg",
  shadow: "--shadow",
};

const decls = (t: Theme) =>
  (Object.keys(VAR) as (keyof ThemeTokens)[]).map((k) => `${VAR[k]}:${t.tokens[k]};`).join("") + `color-scheme:${t.scheme};`;

/**
 * ה-CSS של כל הערכות. [data-theme] עובד גם על אלמנט פנימי — כך נבנות התצוגות המקדימות.
 * בלי בחירה (או "system") — לפי הגדרת המכשיר.
 */
export function themeCss(): string {
  const light = THEME_BY_ID.get(DEFAULT_LIGHT)!;
  const dark = THEME_BY_ID.get(DEFAULT_DARK)!;
  return [
    `:root{${decls(light)}}`,
    `@media (prefers-color-scheme: dark){:root:not([data-theme]),[data-theme="system"]{${decls(dark)}}}`,
    ...THEMES.map((t) => `[data-theme="${t.id}"]{${decls(t)}}`),
  ].join("\n");
}

export const isThemeChoice = (x: unknown): x is ThemeChoice =>
  x === "system" || (typeof x === "string" && THEME_BY_ID.has(x));
