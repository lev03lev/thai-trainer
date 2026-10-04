import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { THEMES, themeCss, type ThemeTokens } from "@/themes/themes";

// ---------- חישוב ניגודיות WCAG ----------
function lum(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** זוגות [טקסט, רקע, מינימום] — כל צירוף שמופיע בממשק */
const PAIRS: [keyof ThemeTokens, keyof ThemeTokens, number][] = [
  ["text", "bg", 7],
  ["text", "surface", 7],
  ["text", "surface2", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["muted", "surface2", 4.5],
  ["muted", "accentSoft", 4.5], // טקסט משני בכרטיס הפתיחה
  ["accent", "bg", 4.5], // קישורים וכותרות מצבים
  ["accent", "surface", 4.5],
  ["accentInk", "accent", 4.5], // טקסט על כפתור ראשי
  ["text", "accentSoft", 4.5], // תשובה שנבחרה
  ["ok", "okSoft", 4.5],
  ["bad", "badSoft", 4.5],
  ["warn", "warnSoft", 4.5],
  ["text", "okSoft", 4.5], // משוב "נכון"
  ["text", "badSoft", 4.5], // משוב "לא נכון"
  ["focus", "bg", 3], // טבעת פוקוס (רכיב לא-טקסטואלי)
  ["focus", "surface", 3],
];

describe("ערכות עיצוב", () => {
  it("לכל ערכה מזהה ייחודי, שם ותיאור", () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    expect(THEMES.length).toBeGreaterThanOrEqual(8);
    for (const t of THEMES) {
      expect(t.name.length).toBeGreaterThan(1);
      expect(t.description.length).toBeGreaterThan(5);
      expect(t.id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  for (const t of THEMES) {
    it(`ניגודיות קריאה בערכה ״${t.name}״`, () => {
      const fails: string[] = [];
      for (const [fg, bg, min] of PAIRS) {
        const c = contrast(t.tokens[fg], t.tokens[bg]);
        if (c < min) fails.push(`${fg} על ${bg}: ${c.toFixed(2)} (נדרש ${min})`);
      }
      expect(fails).toEqual([]);
    });
  }

  it("ה-CSS שנוצר מכיל את כל הערכות ואת ברירת המחדל לפי המכשיר", () => {
    const css = themeCss();
    for (const t of THEMES) expect(css).toContain(`[data-theme="${t.id}"]`);
    expect(css).toContain("prefers-color-scheme: dark");
  });

  it("אין צבעים קבועים בקוד הממשק — רק משתני ערכה", () => {
    const root = path.join(process.cwd(), "src");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) {
          // הגדרות הערכות עצמן, ואיורי האווטרים (אמנות עם פלטה משלה) — מותרים
          if (["themes", "avatars", "data"].includes(f.name)) continue;
          walk(p);
        } else if (/\.(tsx?|css)$/.test(f.name)) {
          const src = fs.readFileSync(p, "utf8");
          // (?<![\w/]) — לא לתפוס עוגנים בקישורים כמו /review#def-category
          const m = src.match(/(?<![\w/])#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g);
          if (m) offenders.push(`${path.relative(root, p)}: ${m.join(" ")}`);
        }
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });
});
