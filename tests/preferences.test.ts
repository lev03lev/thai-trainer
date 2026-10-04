import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { AVATARS, AVATAR_BY_ID } from "@/avatars/avatars";
import { Avatar } from "@/components/Avatar";
import { NAME_MAX, cleanName, defaultPreferences, initialOf, sanitizePreferences } from "@/lib/preferences/model";
import { THEMES } from "@/themes/themes";
import { themeBootScript } from "@/themes/apply";

const known = (id: string) => AVATAR_BY_ID.has(id);

describe("העדפות משתמש", () => {
  it("ברירת מחדל: לפי המכשיר, בלי שם ובלי אווטר", () => {
    expect(defaultPreferences()).toMatchObject({ v: 1, theme: "system", displayName: "", avatarId: null });
  });

  it("ניקוי נתונים פגומים או ישנים במקום לשבור את הממשק", () => {
    expect(sanitizePreferences(null, known).theme).toBe("system");
    expect(sanitizePreferences("garbage", known).displayName).toBe("");
    const p = sanitizePreferences({ theme: "no-such-theme", displayName: 42, avatarId: "nope", updatedAt: "x" }, known);
    expect(p).toMatchObject({ theme: "system", displayName: "", avatarId: null, updatedAt: 0 });
    const ok = sanitizePreferences({ theme: "ocean", displayName: "  נוגה  ", avatarId: "food-chili" }, known);
    expect(ok).toMatchObject({ theme: "ocean", displayName: "נוגה", avatarId: "food-chili" });
  });

  it("שם תצוגה: רווחים, תווי כיווניות נסתרים ואורך מקסימלי", () => {
    expect(cleanName("  נוגה   כהן ")).toBe("נוגה כהן");
    expect(cleanName("נוגה‮‏")).toBe("נוגה");
    expect(cleanName("א".repeat(50))).toHaveLength(NAME_MAX);
    expect(initialOf(" noga")).toBe("N");
    expect(initialOf("")).toBe("");
  });

  it("בנק אווטרים: מגוון, מזהים ייחודיים ושמות בעברית", () => {
    expect(AVATARS.length).toBeGreaterThanOrEqual(30); // איורי ה-SVG שלנו; הגלריה המלאה נבדקת ב-avatars.test.ts
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length);
    for (const a of AVATARS) {
      expect(a.label).toMatch(/[א-ת]/);
      const html = renderToStaticMarkup(createElement(Avatar, { id: a.id, size: 40 }));
      expect(html).toContain("<svg");
      expect(html).toContain(`aria-label="${a.label.replace(/'/g, "&#x27;")}"`);
      // בלי מזהים פנימיים (id=) שעלולים להתנגש כשאותו אווטר מופיע כמה פעמים בדף
      expect(html).not.toMatch(/\sid="/);
    }
  });

  it("אווטר חלופי: האות הראשונה של השם", () => {
    const html = renderToStaticMarkup(createElement(Avatar, { id: null, name: "נוגה", size: 40 }));
    expect(html).toContain("avatar-fallback");
    expect(html).toContain(">נ<");
  });

  it("סקריפט הטעינה מכיר את כל הערכות ואת מפתח האחסון", () => {
    const s = themeBootScript();
    for (const t of THEMES) expect(s).toContain(`"${t.id}"`);
    expect(s).toContain("thai-trainer:prefs:v1");
  });
});
