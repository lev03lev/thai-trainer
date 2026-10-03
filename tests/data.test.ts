import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SPECS } from "@/data/menu-spec";
import { DISHES } from "@/data/menu";
import { ISSUES, ISSUE_BY_ID } from "@/data/issues";
import { inQuote } from "@/lib/text";

const pub = (p: string) => path.join(process.cwd(), "public", p);

describe("נאמנות הנתונים לחוברת", () => {
  it("39 מנות מודפסות (עמוד לכל מנה) ועוד מנות שנוספו בכתב יד", () => {
    const printed = DISHES.filter((d) => !d.handwrittenDish);
    expect(printed.map((d) => d.page)).toEqual(Array.from({ length: 39 }, (_, i) => i + 1));
    expect(DISHES.filter((d) => d.handwrittenDish).map((d) => d.id).sort()).toEqual(["glam-plee", "pad-phet"]);
    expect(new Set(DISHES.map((d) => d.id)).size).toBe(DISHES.length);
    for (const d of DISHES.filter((x) => x.handwrittenDish)) {
      expect(d.image).toBeUndefined();
      expect(d.description.src.kind).toBe("handwritten");
    }
  });

  it("כל מרכיב הוא ציטוט מתוך התיאור", () => {
    for (const s of SPECS) for (const x of s.ing) expect(inQuote(x, s.desc), `${s.id}: ${x}`).toBe(true);
  });

  it("כל נקודה במשפט המלצרים היא ציטוט מתוכו", () => {
    for (const s of SPECS) for (const x of s.wp ?? []) expect(inQuote(x, s.waiter!), `${s.id}: ${x}`).toBe(true);
  });

  it("אלרגנים, שינויים והערות הם ציטוטים מהשדה שלהם", () => {
    for (const s of SPECS) {
      for (const x of s.al ?? []) expect(inQuote(x, s.allergens!), `${s.id} allergen ${x}`).toBe(true);
      for (const x of [...(s.yes ?? []), ...(s.no ?? [])]) expect(inQuote(x, s.changes!), `${s.id} change ${x}`).toBe(true);
      for (const x of s.notesItems ?? []) expect(inQuote(x, s.notes!), `${s.id} note ${x}`).toBe(true);
    }
  });

  it("ערכי גלוטן / חלב / MSG / חריפות תואמים את נוסח המקור", () => {
    const FREE = /^(אינו מכיל|ללא|לא|אין)/;
    const HAS = /^(מכיל|כן|סויה|אויסטר|חמאה)/;
    for (const s of SPECS) {
      // שדות מכתב יד שאושר נבדקים ידנית — הנוסח שלהם לא בפורמט של השדה המודפס
      const hw = (f: string) => s.kind === "handwritten" || (s.hwFields as string[] | undefined)?.includes(f);
      if (hw("gluten") || hw("spice")) {
        if (s.sl !== undefined) expect(s.spice!, s.id).toContain(`${s.sl}/10`);
        continue;
      }
      if (s.g === "free") expect(s.gluten, s.id).toMatch(FREE);
      if (s.g === "contains") expect(s.gluten, s.id).toMatch(HAS);
      if (s.d === "free") expect(s.dairy, s.id).toMatch(FREE);
      if (s.d === "contains") expect(s.dairy, s.id).toMatch(HAS);
      if (s.m) expect(s.msg!, s.id).toMatch(s.m.has ? /^(יש|כן)/ : /^(אין|ללא|לא)/);
      if (s.m?.removable === true) expect(s.msg!).toContain("אפשר להוציא");
      if (s.m?.removable === false) expect(s.msg!).toMatch(/(אי אפשר|לא ניתן) להוציא/);
      if (s.sl !== undefined) expect(s.spice!, s.id).toContain(`${s.sl}/10`);
    }
  });

  it("שדה ריק נשאר לא ידוע (לא ״אין״)", () => {
    const koi = DISHES.find((d) => d.id === "koi-pla")!;
    expect(koi.gluten).toBeUndefined();
    expect(koi.dairy).toBeUndefined();
    expect(koi.allergens).toBeUndefined();
    expect(koi.waiter).toBeUndefined();
  });

  it("כל חסימה מפנה לשאלה פתוחה קיימת", () => {
    for (const s of SPECS) {
      for (const id of Object.values(s.block ?? {})) expect(ISSUE_BY_ID.has(id!), `${s.id} → ${id}`).toBe(true);
      for (const h of s.hand ?? []) if (h.issue) expect(ISSUE_BY_ID.has(h.issue), `${s.id} → ${h.issue}`).toBe(true);
      for (const v of s.variants ?? []) if (v.issue) expect(ISSUE_BY_ID.has(v.issue), `${s.id} → ${v.issue}`).toBe(true);
    }
  });

  it("הערת כתב היד הנוספת בעמוד קריספי רייס לא נקלטה כמנה", () => {
    const d = DISHES.find((x) => x.id === "num-khao-tod")!;
    const extra = d.hand.find((h) => h.field === "extra-dish")!;
    expect(extra.text).toContain("הושמטה");
    expect(d.description.src.kind).toBe("printed");
  });

  it("תמונות המנות וצילומי הבירור קיימים", () => {
    for (const d of DISHES) if (d.image) expect(fs.existsSync(pub(d.image.value)), d.image.value).toBe(true);
    for (const i of ISSUES) for (const c of i.crops) expect(fs.existsSync(pub(c)), c).toBe(true);
  });

  it("שמות לועזיים בתווים לטיניים בלבד", () => {
    for (const d of DISHES) if (d.latin) expect(d.latin.value).toMatch(/^[A-Za-z0-9 |'-]+$/);
  });
});
