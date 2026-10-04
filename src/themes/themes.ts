// ערכות עיצוב (Themes). כל ערכה מוגדרת פעם אחת כאן, וה-CSS נוצר ממנה אוטומטית.
// להוספת ערכה: מוסיפים אובייקט ל-THEMES. בדיקת הניגודיות (tests/themes.test.ts) תבדוק אותה.
//
// לכל ערכה שני חלקים:
//   tokens — צבעים (נבדקים לניגודיות)
//   style  — "אופי": רקע מצויר, גרדיאנט לכפתורים, גופן כותרות, עיגול פינות, עובי מסגרת, צל.
//            כל שדה ב-style אופציונלי; מה שלא מוגדר מקבל ברירת מחדל.

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

export type FontRole = "rubik" | "round" | "display" | "serif";

export interface ThemeStyle {
  /** שכבות רקע (ערך background מלא, כולל גדלים ותבניות) מעל צבע הרקע */
  bgArt: string;
  /** רקע כרטיס הפתיחה ותצוגת הפרופיל */
  heroArt: string;
  /** שני צבעים לגרדיאנט הכפתור הראשי; בלי — כפתור בצבע accent אחיד */
  btnEnds?: [string, string];
  btnShadow: string;
  radius: string;
  radiusSm: string;
  borderWidth: string;
  fontBody: FontRole;
  fontHeading: FontRole;
  /** כותרות המקטעים בצבע הערכה (accent) במקום בצבע הטקסט */
  accentHeadings: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  scheme: "light" | "dark";
  /** תגיות קצרות שמוצגות בבורר */
  vibe: string;
  tokens: ThemeTokens;
  style?: Partial<ThemeStyle>;
}

const SHADOW_LIGHT = "0 1px 2px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.05)";
const SHADOW_DARK = "0 1px 2px rgb(0 0 0 / 0.35), 0 8px 24px rgb(0 0 0 / 0.25)";

/** הרקע הרך של העיצוב המקורי — שני "זוהרים" עדינים בצבעי הערכה */
const SOFT_GLOW =
  "radial-gradient(900px 360px at 100% -80px, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%), radial-gradient(700px 300px at 0% -60px, color-mix(in srgb, var(--accent-2) 8%, transparent), transparent 70%)";

const stars = (c1: string, c2: string) =>
  `radial-gradient(1.4px 1.4px at 14px 22px, ${c1} 50%, transparent 52%) 0 0/97px 97px, radial-gradient(1px 1px at 61px 70px, ${c2} 50%, transparent 52%) 0 0/131px 131px, radial-gradient(1.8px 1.8px at 40px 40px, ${c1} 50%, transparent 52%) 0 0/211px 211px`;

const DEFAULT_STYLE: ThemeStyle = {
  bgArt: SOFT_GLOW,
  heroArt: "linear-gradient(150deg, var(--accent-soft), var(--surface) 70%)",
  btnShadow: "none",
  radius: "14px",
  radiusSm: "12px",
  borderWidth: "1px",
  fontBody: "rubik",
  fontHeading: "rubik",
  accentHeadings: false,
};

export const THEMES: Theme[] = [
  // ---------------- בהירות ----------------
  {
    id: "light",
    name: "קלאסי",
    description: "קרם חמים וטרקוטה — העיצוב המקורי",
    scheme: "light",
    vibe: "חמים",
    tokens: {
      bg: "#fbf8f3", surface: "#ffffff", surface2: "#f3eee6", text: "#1f1a14", muted: "#62584c", border: "#e2d9cc",
      accent: "#b2451f", accentInk: "#ffffff", accentSoft: "#fbe9e1", accent2: "#d98b2b",
      ok: "#1e6b3a", okSoft: "#e3f3e8", bad: "#a8261c", badSoft: "#fbe6e4", warn: "#7a4d00", warnSoft: "#fff1d6",
      focus: "#1b5fd1", imgBg: "#ffffff", shadow: SHADOW_LIGHT,
    },
  },
  {
    id: "sunset",
    name: "שקיעה",
    description: "אפרסק, ורוד וכתום — ערב חמים על החוף",
    scheme: "light",
    vibe: "צבעוני",
    tokens: {
      bg: "#fff4ec", surface: "#fffaf6", surface2: "#ffe9dc", text: "#2d1408", muted: "#714a37", border: "#f7d3bf",
      accent: "#b93a0d", accentInk: "#ffffff", accentSoft: "#ffe2d2", accent2: "#d6336c",
      ok: "#1d6b3c", okSoft: "#e2f3e7", bad: "#ad1f3f", badSoft: "#fde3ea", warn: "#7a4a00", warnSoft: "#fff0d4",
      focus: "#5b3fd6", imgBg: "#ffffff", shadow: "0 2px 4px rgb(185 58 13 / 0.08), 0 10px 30px rgb(214 51 108 / 0.10)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(1000px 420px at 85% -120px, #ff9e7a55, transparent 70%), radial-gradient(800px 380px at 0% -80px, #ff7aa855, transparent 70%), linear-gradient(180deg, #ffe0cc 0, #fff4ec 420px)",
      heroArt: "linear-gradient(135deg, #ffd9c2, #ffe3ec 55%, #fffaf6)",
      btnEnds: ["#c2410c", "#be185d"],
      radius: "20px",
      radiusSm: "14px",
      fontBody: "round",
      fontHeading: "round",
    },
  },
  {
    id: "mango",
    name: "מנגו סטיקי רייס",
    description: "צהוב מנגו בשל, ירוק עלה וקרם קוקוס",
    scheme: "light",
    vibe: "קינוח",
    tokens: {
      bg: "#fffaec", surface: "#ffffff", surface2: "#fdf0cc", text: "#2e2208", muted: "#6b5622", border: "#f0dca0",
      accent: "#a84a07", accentInk: "#ffffff", accentSoft: "#fdeccb", accent2: "#5f9a0d",
      ok: "#2f6b12", okSoft: "#e6f4d8", bad: "#a8241c", badSoft: "#fbe4e1", warn: "#6e4800", warnSoft: "#fff0c8",
      focus: "#1b5fd1", imgBg: "#ffffff", shadow: "0 2px 4px rgb(168 74 7 / 0.08), 0 8px 24px rgb(240 180 40 / 0.18)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(900px 420px at 100% -100px, #ffcf4a55, transparent 70%), radial-gradient(700px 360px at 0% -40px, #9fd36655, transparent 70%), radial-gradient(#e8c96a33 1.2px, transparent 1.6px) 0 0/22px 22px",
      heroArt: "linear-gradient(135deg, #ffe08a, #fff3cf 55%, #ffffff)",
      btnEnds: ["#b45309", "#9a3412"],
      radius: "18px",
      radiusSm: "14px",
      fontHeading: "round",
    },
  },
  {
    id: "sakura",
    name: "סאקורה",
    description: "פריחת דובדבן — ורוד רך ועלי כותרת",
    scheme: "light",
    vibe: "רך",
    tokens: {
      bg: "#fff7f9", surface: "#ffffff", surface2: "#fdeaf1", text: "#3b1f2b", muted: "#7a5163", border: "#f6d3df",
      accent: "#b0124f", accentInk: "#ffffff", accentSoft: "#fde0ea", accent2: "#f06292",
      ok: "#1e6b3a", okSoft: "#e3f3e8", bad: "#a3122a", badSoft: "#fde2e6", warn: "#7a4d00", warnSoft: "#fff0d9",
      focus: "#1b5fd1", imgBg: "#ffffff", shadow: "0 2px 6px rgb(176 18 79 / 0.07), 0 12px 32px rgb(240 98 146 / 0.10)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(9px 6px at 40px 60px, #f8bbd0 60%, transparent 64%) 0 0/230px 230px, radial-gradient(7px 5px at 170px 30px, #f48fb1aa 60%, transparent 64%) 0 0/270px 270px, radial-gradient(6px 4px at 110px 150px, #fcd2e0 60%, transparent 64%) 0 0/190px 190px, radial-gradient(800px 340px at 100% -60px, #f8bbd066, transparent 70%)",
      heroArt: "linear-gradient(135deg, #fde0ea, #fff5f8 60%, #ffffff)",
      btnEnds: ["#c2185b", "#a3124a"],
      radius: "24px",
      radiusSm: "16px",
      fontBody: "round",
      fontHeading: "round",
    },
  },
  {
    id: "lavender",
    name: "לבנדר",
    description: "סגול לבנדר מרגיע וענני פסטל",
    scheme: "light",
    vibe: "רגוע",
    tokens: {
      bg: "#f7f4ff", surface: "#ffffff", surface2: "#eee8ff", text: "#231942", muted: "#5b5188", border: "#e0d7fb",
      accent: "#6227d0", accentInk: "#ffffff", accentSoft: "#ece4ff", accent2: "#c084fc",
      ok: "#1e6b3a", okSoft: "#e3f3e8", bad: "#ad2128", badSoft: "#fbe4e6", warn: "#7a4d00", warnSoft: "#fff0d9",
      focus: "#c2410c", imgBg: "#ffffff", shadow: "0 2px 6px rgb(98 39 208 / 0.07), 0 12px 32px rgb(98 39 208 / 0.08)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(700px 360px at 90% -60px, #c4b5fd66, transparent 70%), radial-gradient(600px 320px at 5% 10%, #f0abfc44, transparent 70%), radial-gradient(900px 400px at 50% 120%, #ddd6fe66, transparent 70%)",
      heroArt: "linear-gradient(135deg, #e9dcff, #f6f1ff 60%, #ffffff)",
      btnEnds: ["#6d28d9", "#9333ea"],
      radius: "20px",
      radiusSm: "14px",
      fontBody: "round",
      fontHeading: "round",
    },
  },
  {
    id: "arctic",
    name: "ארקטי",
    description: "קרח, שלג ותכלת קפוא — נקי וצלול",
    scheme: "light",
    vibe: "קריר",
    tokens: {
      bg: "#eef6fb", surface: "#ffffff", surface2: "#e1eff8", text: "#0b2233", muted: "#46627a", border: "#cde2ef",
      accent: "#03649a", accentInk: "#ffffff", accentSoft: "#dcefff", accent2: "#38bdf8",
      ok: "#14683f", okSoft: "#ddf3e7", bad: "#b0282b", badSoft: "#fbe5e5", warn: "#7a4d00", warnSoft: "#fff1d6",
      focus: "#c2410c", imgBg: "#ffffff", shadow: "0 1px 2px rgb(3 100 154 / 0.06), 0 10px 34px rgb(3 100 154 / 0.10)",
    },
    style: {
      bgArt:
        "linear-gradient(160deg, #ffffffaa 0 20%, transparent 20% 22%, #ffffff66 22% 30%, transparent 30%) 0 0/100% 520px no-repeat, radial-gradient(900px 400px at 100% -80px, #bae6fd88, transparent 70%), linear-gradient(180deg, #dff1fc 0, #eef6fb 380px)",
      heroArt: "linear-gradient(135deg, #d6eeff, #f3faff 60%, #ffffff)",
      btnEnds: ["#0369a1", "#075985"],
      radius: "20px",
      radiusSm: "14px",
    },
  },
  {
    id: "ocean",
    name: "אוקיינוס",
    description: "כחול עמוק וטורקיז — גלים של רוגע",
    scheme: "light",
    vibe: "ימי",
    tokens: {
      bg: "#f1f7fa", surface: "#ffffff", surface2: "#e2eef4", text: "#0d2430", muted: "#465f6c", border: "#cddfe8",
      accent: "#0a6c94", accentInk: "#ffffff", accentSoft: "#dbeff8", accent2: "#14a3a3",
      ok: "#1d6b45", okSoft: "#e0f3e9", bad: "#b0282b", badSoft: "#fbe5e5", warn: "#7a4d00", warnSoft: "#fff1d6",
      focus: "#c2410c", imgBg: "#ffffff", shadow: SHADOW_LIGHT,
    },
    style: {
      bgArt:
        "radial-gradient(1400px 420px at 50% calc(100% + 260px), #14a3a333, transparent 60%), radial-gradient(900px 300px at 100% -60px, #0a6c9426, transparent 70%), repeating-radial-gradient(circle at 0 100%, transparent 0 38px, #0a6c940a 38px 40px)",
      heroArt: "linear-gradient(135deg, #cfeef4, #eef8fb 60%, #ffffff)",
      btnEnds: ["#0a6c94", "#0d7a6f"],
    },
  },
  {
    id: "forest",
    name: "יער",
    description: "ירוק מרווה, עלים ואור שמש מבעד לעצים",
    scheme: "light",
    vibe: "טבעי",
    tokens: {
      bg: "#f2f5ef", surface: "#fbfcf9", surface2: "#e5ebde", text: "#18241b", muted: "#4c5c4f", border: "#d1dbc9",
      accent: "#2d6a3d", accentInk: "#ffffff", accentSoft: "#dfeddd", accent2: "#a07a22",
      ok: "#22633a", okSoft: "#ddefe1", bad: "#a3311f", badSoft: "#f8e3de", warn: "#6b4900", warnSoft: "#f6ead0",
      focus: "#1b5fd1", imgBg: "#ffffff", shadow: SHADOW_LIGHT,
    },
    style: {
      bgArt:
        "radial-gradient(700px 400px at 100% -80px, #f5e6a855, transparent 70%), radial-gradient(600px 360px at 0% 0%, #9cc79a44, transparent 70%), repeating-linear-gradient(135deg, #2d6a3d08 0 14px, transparent 14px 28px)",
      heroArt: "linear-gradient(135deg, #d8ead2, #f1f6ec 60%, #fbfcf9)",
      radius: "16px",
    },
  },
  {
    id: "desert",
    name: "מדבר",
    description: "חולות זהובים, טרקוטה ושמיים פתוחים",
    scheme: "light",
    vibe: "אדמתי",
    tokens: {
      bg: "#faf1e4", surface: "#fffaf3", surface2: "#f3e3cc", text: "#3a2412", muted: "#71533a", border: "#e9d1b0",
      accent: "#9e470b", accentInk: "#ffffff", accentSoft: "#f8e3c8", accent2: "#2a9d8f",
      ok: "#256a3c", okSoft: "#e2f1e2", bad: "#a3271c", badSoft: "#f9e2dc", warn: "#6b4700", warnSoft: "#f8eccf",
      focus: "#1b5fd1", imgBg: "#ffffff", shadow: "0 2px 4px rgb(158 71 11 / 0.07), 0 8px 26px rgb(158 71 11 / 0.08)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(1400px 500px at 15% calc(100% + 300px), #e9c49a77, transparent 60%), radial-gradient(1200px 420px at 95% calc(100% + 280px), #d9a06b55, transparent 60%), linear-gradient(180deg, #fde4c4 0, #faf1e4 420px)",
      heroArt: "linear-gradient(135deg, #f7d9b0, #fbefdc 60%, #fffaf3)",
      btnEnds: ["#a34a0b", "#8a3a10"],
      radius: "12px",
      radiusSm: "10px",
      fontHeading: "serif",
    },
  },
  {
    id: "retro",
    name: "רטרו",
    description: "שנות ה-70: קווי מתאר בולטים, צללים קשים ונקודות",
    scheme: "light",
    vibe: "נועז",
    tokens: {
      bg: "#fdf3e1", surface: "#fffaf0", surface2: "#f6e7c8", text: "#2b1d0e", muted: "#634a2c", border: "#2b1d0e",
      accent: "#b33a0b", accentInk: "#ffffff", accentSoft: "#fde2c7", accent2: "#0f766e",
      ok: "#1f6a3a", okSoft: "#dff2e3", bad: "#a3231b", badSoft: "#fbe1dc", warn: "#6b4500", warnSoft: "#fdebc4",
      focus: "#1d4ed8", imgBg: "#ffffff", shadow: "4px 4px 0 0 #2b1d0e",
    },
    style: {
      accentHeadings: true,
      bgArt: "radial-gradient(#2b1d0e1a 1.3px, transparent 1.6px) 0 0/18px 18px",
      heroArt: "linear-gradient(135deg, #ffd59e, #fde7c4 50%, #fffaf0)",
      btnShadow: "3px 3px 0 0 #2b1d0e",
      radius: "10px",
      radiusSm: "8px",
      borderWidth: "2px",
      fontHeading: "display",
    },
  },
  {
    id: "lotus",
    name: "לוטוס",
    description: "ורוד פרחוני עדין עם שזיף עמוק",
    scheme: "light",
    vibe: "פרחוני",
    tokens: {
      bg: "#fbf5f8", surface: "#ffffff", surface2: "#f3e6ee", text: "#2a1421", muted: "#694a5c", border: "#ead3df",
      accent: "#a3266f", accentInk: "#ffffff", accentSoft: "#f8e0ed", accent2: "#6d3fd1",
      ok: "#1e6b3a", okSoft: "#e3f3e8", bad: "#ad2128", badSoft: "#fbe4e6", warn: "#7a4d00", warnSoft: "#fff0d9",
      focus: "#1b5fd1", imgBg: "#ffffff", shadow: SHADOW_LIGHT,
    },
    style: {
      bgArt:
        "radial-gradient(800px 360px at 100% -60px, #f5b5d455, transparent 70%), radial-gradient(600px 300px at 0% 20%, #c9b6f544, transparent 70%)",
      radius: "18px",
    },
  },
  // ---------------- כהות ----------------
  {
    id: "dark",
    name: "לילה חם",
    description: "כהה ונעים לעיניים, עם נגיעות כתומות",
    scheme: "dark",
    vibe: "חמים",
    tokens: {
      bg: "#17130f", surface: "#221c16", surface2: "#2c251d", text: "#f3ece2", muted: "#bfb3a3", border: "#3d342a",
      accent: "#f08a5d", accentInk: "#1b120c", accentSoft: "#3a2419", accent2: "#e7b85c",
      ok: "#7fd49a", okSoft: "#173222", bad: "#ff8f84", badSoft: "#3b1a17", warn: "#ffcc6e", warnSoft: "#3a2c10",
      focus: "#8ab4ff", imgBg: "#efe9e0", shadow: SHADOW_DARK,
    },
  },
  {
    id: "midnight",
    name: "חצות",
    description: "כחול לילה עמוק, כוכבים ותכלת קריר",
    scheme: "dark",
    vibe: "שקט",
    tokens: {
      bg: "#0b1020", surface: "#121a2f", surface2: "#1a2440", text: "#e8ecf8", muted: "#a6b1cd", border: "#29355a",
      accent: "#8ab4ff", accentInk: "#0b1020", accentSoft: "#1c2b50", accent2: "#b39dff",
      ok: "#6ee7a8", okSoft: "#11301f", bad: "#ff8f8f", badSoft: "#3a1621", warn: "#ffd479", warnSoft: "#33290f",
      focus: "#ffd479", imgBg: "#e9edf5", shadow: SHADOW_DARK,
    },
    style: { bgArt: `${stars("#ffffff55", "#b39dff55")}, ${SOFT_GLOW}` },
  },
  {
    id: "galaxy",
    name: "גלקסיה",
    description: "ערפיליות סגולות-ורודות ושדה כוכבים",
    scheme: "dark",
    vibe: "קוסמי",
    tokens: {
      bg: "#0a0618", surface: "#150e2c", surface2: "#1f1642", text: "#f1ecff", muted: "#b5a8de", border: "#33286a",
      accent: "#b09afc", accentInk: "#120a2a", accentSoft: "#2a1d5a", accent2: "#f472b6",
      ok: "#6ee7b7", okSoft: "#0f2e26", bad: "#ff8fa3", badSoft: "#3a1428", warn: "#fcd34d", warnSoft: "#33290c",
      focus: "#67e8f9", imgBg: "#ece8f7", shadow: "0 2px 6px rgb(0 0 0 / 0.4), 0 12px 40px rgb(124 58 237 / 0.18)",
    },
    style: {
      accentHeadings: true,
      bgArt: `${stars("#ffffffaa", "#f9a8d4aa")}, radial-gradient(700px 420px at 85% 5%, #7c3aed44, transparent 70%), radial-gradient(600px 400px at 10% 40%, #db277733, transparent 70%), radial-gradient(800px 500px at 50% 110%, #2563eb33, transparent 70%)`,
      heroArt: "linear-gradient(135deg, #3b1d7a, #1f1642 55%, #150e2c)",
      btnEnds: ["#b09afc", "#f472b6"],
      btnShadow: "0 6px 24px rgb(244 114 182 / 0.25)",
      radius: "18px",
      fontHeading: "display",
    },
  },
  {
    id: "neon",
    name: "ניאון",
    description: "סגול לילי עם ורוד וציאן זוהרים",
    scheme: "dark",
    vibe: "זוהר",
    tokens: {
      bg: "#120b1f", surface: "#1b1230", surface2: "#251a40", text: "#f3eaff", muted: "#bcabda", border: "#3a2c60",
      accent: "#ee82fa", accentInk: "#1b0b24", accentSoft: "#3a1d4c", accent2: "#22d3ee",
      ok: "#5eead4", okSoft: "#0f2f2c", bad: "#fb7f93", badSoft: "#3b1425", warn: "#fde047", warnSoft: "#33300c",
      focus: "#22d3ee", imgBg: "#ece6f5", shadow: "0 0 0 1px rgb(238 130 250 / 0.12), 0 10px 30px rgb(0 0 0 / 0.4)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(600px 400px at 90% 0%, #ee82fa33, transparent 70%), radial-gradient(500px 400px at 0% 30%, #22d3ee26, transparent 70%)",
      btnEnds: ["#ee82fa", "#22d3ee"],
      btnShadow: "0 0 22px rgb(238 130 250 / 0.35)",
      radius: "16px",
    },
  },
  {
    id: "cyber",
    name: "סייבר",
    description: "מסוף האקרים: רשת זוהרת, ירוק מנטה ומג'נטה",
    scheme: "dark",
    vibe: "טכנו",
    tokens: {
      bg: "#05070d", surface: "#0b1220", surface2: "#101a2d", text: "#e3fff6", muted: "#8db8ad", border: "#1b3a45",
      accent: "#00f0a0", accentInk: "#00170e", accentSoft: "#08291f", accent2: "#ff2bd6",
      ok: "#3dffa8", okSoft: "#062c1b", bad: "#ff6b8e", badSoft: "#300d18", warn: "#ffe14d", warnSoft: "#2b2608",
      focus: "#ff2bd6", imgBg: "#e6f2ee", shadow: "0 0 0 1px rgb(0 240 160 / 0.18), 0 0 26px rgb(0 240 160 / 0.08)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "linear-gradient(#00f0a014 1px, transparent 1px) 0 0/32px 32px, linear-gradient(90deg, #00f0a014 1px, transparent 1px) 0 0/32px 32px, radial-gradient(900px 420px at 50% -120px, #ff2bd62a, transparent 70%)",
      heroArt: "linear-gradient(135deg, #08291f, #0b1220 60%), linear-gradient(90deg, #00f0a01a 1px, transparent 1px) 0 0/24px 24px",
      btnShadow: "0 0 18px rgb(0 240 160 / 0.45)",
      radius: "6px",
      radiusSm: "4px",
      fontHeading: "display",
    },
  },
  {
    id: "bangkok",
    name: "בנגקוק בלילה",
    description: "אורות רחוב, טוק-טוק צהוב ושלטי ניאון ורודים",
    scheme: "dark",
    vibe: "תוסס",
    tokens: {
      bg: "#110f18", surface: "#1b1824", surface2: "#252131", text: "#fff8e6", muted: "#c9bfa6", border: "#3a3448",
      accent: "#ffcc1a", accentInk: "#1a1400", accentSoft: "#3a3110", accent2: "#ff3d7f",
      ok: "#7ee0a1", okSoft: "#143022", bad: "#ff8a9b", badSoft: "#3a1520", warn: "#ffd75e", warnSoft: "#382c0c",
      focus: "#5ee0ff", imgBg: "#f4efe2", shadow: SHADOW_DARK,
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(60px 60px at 12% 18%, #ffcc1a2e, transparent 70%), radial-gradient(90px 90px at 82% 12%, #ff3d7f2e, transparent 70%), radial-gradient(70px 70px at 65% 40%, #5ee0ff22, transparent 70%), radial-gradient(110px 110px at 30% 70%, #ff3d7f1f, transparent 70%), radial-gradient(800px 360px at 50% -120px, #ffcc1a22, transparent 70%)",
      heroArt: "linear-gradient(135deg, #3a3110, #1b1824 60%)",
      btnEnds: ["#ffcc1a", "#ff9f1a"],
      btnShadow: "0 6px 22px rgb(255 204 26 / 0.25)",
      radius: "16px",
      fontHeading: "display",
    },
  },
  {
    id: "emerald",
    name: "אמרלד",
    description: "ירוק אבן חן עמוק עם ניצוצות זהב",
    scheme: "dark",
    vibe: "יוקרתי",
    tokens: {
      bg: "#04140f", surface: "#0a2219", surface2: "#0f2e22", text: "#e9fbf3", muted: "#9ccab6", border: "#1c4636",
      accent: "#34d399", accentInk: "#032015", accentSoft: "#0f3a2b", accent2: "#fbbf24",
      ok: "#86efac", okSoft: "#0d3320", bad: "#fda4a4", badSoft: "#3a1717", warn: "#fcd34d", warnSoft: "#33290c",
      focus: "#fbbf24", imgBg: "#e8f2ed", shadow: "0 2px 6px rgb(0 0 0 / 0.4), 0 12px 36px rgb(52 211 153 / 0.08)",
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(800px 420px at 85% -80px, #34d39933, transparent 70%), radial-gradient(500px 300px at 0% 30%, #fbbf241f, transparent 70%), repeating-linear-gradient(60deg, #34d3990a 0 1px, transparent 1px 26px), repeating-linear-gradient(-60deg, #34d3990a 0 1px, transparent 1px 26px)",
      heroArt: "linear-gradient(135deg, #0f3a2b, #0a2219 60%)",
      btnEnds: ["#34d399", "#fbbf24"],
      radius: "14px",
      fontHeading: "serif",
    },
  },
  {
    id: "gold",
    name: "זהב תאילנדי",
    description: "שחור פחם וזהב — אווירת מקדש בלילה",
    scheme: "dark",
    vibe: "מקדש",
    tokens: {
      bg: "#14110b", surface: "#1e1910", surface2: "#2a2316", text: "#f5ecd8", muted: "#c4b596", border: "#3d3420",
      accent: "#e6b450", accentInk: "#1a1307", accentSoft: "#392d12", accent2: "#e0703a",
      ok: "#8fd694", okSoft: "#18301a", bad: "#ff8f7f", badSoft: "#3b1a14", warn: "#ffd27a", warnSoft: "#382b0f",
      focus: "#8ab4ff", imgBg: "#f1ebdf", shadow: SHADOW_DARK,
    },
    style: {
      accentHeadings: true,
      bgArt:
        "radial-gradient(circle at 50% -10%, #e6b45026, transparent 55%), repeating-linear-gradient(45deg, #e6b4500c 0 2px, transparent 2px 22px), repeating-linear-gradient(-45deg, #e6b4500c 0 2px, transparent 2px 22px)",
      heroArt: "linear-gradient(135deg, #3d2f10, #1e1910 60%)",
      btnEnds: ["#e6b450", "#c98a2b"],
      fontHeading: "serif",
    },
  },
  {
    id: "contrast",
    name: "ניגודיות גבוהה",
    description: "שחור, לבן וצהוב — הכי קריא שיש",
    scheme: "dark",
    vibe: "נגיש",
    tokens: {
      bg: "#000000", surface: "#000000", surface2: "#1a1a1a", text: "#ffffff", muted: "#e6e6e6", border: "#ffffff",
      accent: "#ffe500", accentInk: "#000000", accentSoft: "#2b2600", accent2: "#00e5ff",
      ok: "#3dff8a", okSoft: "#002a12", bad: "#ff7a7a", badSoft: "#2e0000", warn: "#ffe500", warnSoft: "#262100",
      focus: "#00e5ff", imgBg: "#ffffff", shadow: "none",
    },
    style: { bgArt: "none", heroArt: "none", borderWidth: "2px" },
  },
];

export type ThemeId = string;
/** "system" = לפי הגדרת המכשיר (קלאסי ביום, לילה חם בלילה) */
export type ThemeChoice = ThemeId | "system";

export const DEFAULT_LIGHT = "light";
export const DEFAULT_DARK = "dark";
export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]));

export function styleOf(t: Theme): ThemeStyle {
  return { ...DEFAULT_STYLE, ...t.style };
}

/** משתני הגופנים — מוגדרים ב-layout.tsx (next/font) */
export const FONT_VAR: Record<FontRole, string> = {
  rubik: "var(--font-rubik)",
  round: "var(--font-round), var(--font-rubik)",
  display: "var(--font-display), var(--font-rubik)",
  serif: "var(--font-serif), var(--font-rubik)",
};

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

function decls(t: Theme): string {
  const s = styleOf(t);
  const colors = (Object.keys(VAR) as (keyof ThemeTokens)[]).map((k) => `${VAR[k]}:${t.tokens[k]};`).join("");
  const btn = s.btnEnds ? `linear-gradient(135deg, ${s.btnEnds[0]}, ${s.btnEnds[1]})` : "var(--accent)";
  return (
    colors +
    `--bg-art:${s.bgArt};--hero-art:${s.heroArt};--btn-bg:${btn};--btn-shadow:${s.btnShadow};` +
    `--radius:${s.radius};--radius-sm:${s.radiusSm};--border-w:${s.borderWidth};` +
    `--font-body:${FONT_VAR[s.fontBody]};--font-heading:${FONT_VAR[s.fontHeading]};` +
    `--heading:${s.accentHeadings ? "var(--accent)" : "var(--text)"};` +
    `color-scheme:${t.scheme};`
  );
}

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
