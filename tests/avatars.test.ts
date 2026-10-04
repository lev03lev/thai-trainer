import { describe, expect, it } from "vitest";
import { AVATARS, isKnownAvatar } from "@/avatars/avatars";
import { CATEGORIES, CONFIG_KEYS, CUSTOM_AVATAR_ID, GALLERY } from "@/avatars/catalog";
import { ALL_PARTS, DEFAULT_CONFIG, PART_GROUPS, randomConfig, renderConfig, renderGallery, sanitizeConfig } from "@/avatars/dicebear";
import { looseConfig, normalizeAvatar, sanitizePreferences, defaultPreferences } from "@/lib/preferences/model";
import { mulberry32 } from "@/lib/quiz";

const decode = (uri: string) => decodeURIComponent(uri.replace(/^data:image\/svg\+xml;utf8,/, ""));

describe("בנק האווטרים והעורך", () => {
  it("מגוון גדול: לפחות 90 אווטרים מוכנים בשש קטגוריות", () => {
    expect(AVATARS.length + GALLERY.length).toBeGreaterThanOrEqual(90);
    const ids = [...AVATARS.map((a) => a.id), ...GALLERY.map((g) => g.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CATEGORIES) {
      const n = AVATARS.filter((a) => a.category === c.id).length + GALLERY.filter((g) => g.category === c.id).length;
      expect(n, c.id).toBeGreaterThanOrEqual(12);
    }
  });

  it("כל אווטר בגלריה נוצר כ-SVG", () => {
    for (const g of GALLERY) {
      const uri = renderGallery(g.id)!;
      expect(uri, g.id).toMatch(/^data:image\/svg\+xml/);
      expect(decode(uri)).toContain("<svg");
    }
    expect(renderGallery("no-such-avatar")).toBeNull();
  });

  it("דמויות הגלריה הן הגדרות עורך תקינות (אפשר לפתוח ולהמשיך לעצב)", () => {
    for (const g of GALLERY.filter((x) => x.config)) expect(sanitizeConfig(g.config), g.id).toEqual(g.config);
  });

  it("העורך: כל החלקים שביקשת קיימים ולכל אפשרות יש ציור", () => {
    const keys = ALL_PARTS.map((p) => p.key);
    for (const k of ["top", "hairColor", "skinColor", "eyes", "accessories", "facialHair", "clothing", "clothesColor", "background"])
      expect(keys).toContain(k);
    expect(new Set(keys)).toEqual(new Set(CONFIG_KEYS));
    for (const p of ALL_PARTS) {
      expect(p.options.length, p.key).toBeGreaterThan(1);
      for (const o of p.none ? ["none", ...p.options] : p.options) {
        const uri = renderConfig({ ...DEFAULT_CONFIG, [p.key]: o });
        expect(uri, `${p.key}=${o}`).toMatch(/^data:image\/svg\+xml/);
      }
    }
    expect(PART_GROUPS.length).toBeGreaterThanOrEqual(6);
  });

  it("שינוי חלק משנה את הציור", () => {
    const a = renderConfig(DEFAULT_CONFIG);
    expect(renderConfig({ ...DEFAULT_CONFIG, top: "bob" })).not.toBe(a);
    expect(renderConfig({ ...DEFAULT_CONFIG, accessories: "round" })).not.toBe(a);
    expect(renderConfig({ ...DEFAULT_CONFIG, background: "1e3c72-2a5298" })).not.toBe(a);
  });

  it("אקראי מייצר תמיד הגדרה תקינה", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const c = randomConfig(rng);
      expect(sanitizeConfig(c)).toEqual(c);
    }
  });

  it("ערכים לא מוכרים מוחלפים בברירת מחדל, ולא שוברים את הציור", () => {
    const c = sanitizeConfig({ ...DEFAULT_CONFIG, top: "<script>", eyes: "laser" });
    expect(c.top).toBe(DEFAULT_CONFIG.top);
    expect(c.eyes).toBe(DEFAULT_CONFIG.eyes);
    expect(looseConfig({ ...DEFAULT_CONFIG, top: "<script>" })).toBeNull();
    expect(looseConfig({ top: "bob" })).toBeNull();
    expect(looseConfig(DEFAULT_CONFIG)).toEqual(DEFAULT_CONFIG);
  });

  it("העדפות: אווטר מעוצב נשמר ונטען; בלי הגדרה — בלי אווטר", () => {
    const p = sanitizePreferences({ avatarId: CUSTOM_AVATAR_ID, avatarCustom: DEFAULT_CONFIG }, isKnownAvatar);
    expect(p.avatarId).toBe(CUSTOM_AVATAR_ID);
    expect(p.avatarCustom).toEqual(DEFAULT_CONFIG);
    const broken = normalizeAvatar(sanitizePreferences({ avatarId: CUSTOM_AVATAR_ID, avatarCustom: "x" }, isKnownAvatar));
    expect(broken.avatarId).toBeNull();
    // מזהים ישנים (מהגרסה הקודמת) עדיין תקינים
    expect(sanitizePreferences({ avatarId: "food-chili" }, isKnownAvatar).avatarId).toBe("food-chili");
    expect(sanitizePreferences({ avatarId: "person-03" }, isKnownAvatar).avatarId).toBe("person-03");
    expect(defaultPreferences().avatarCustom).toBeNull();
  });
});
