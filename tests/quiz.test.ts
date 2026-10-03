import { describe, expect, it } from "vitest";
import { DISHES, DISH_BY_ID, allApprovedText } from "@/data/menu";
import { SPECS } from "@/data/menu-spec";
import {
  allKeys,
  baseWeights,
  makeQuestion,
  mulberry32,
  pickArea,
  TEMPLATES,
  glutenStatus,
  dairyStatus,
  type Question,
} from "@/lib/quiz";
import { inQuote, mentions } from "@/lib/text";

const SEEDS = 25;
const all: Question[] = [];
for (const key of allKeys()) {
  for (let s = 1; s <= SEEDS; s++) {
    const q = makeQuestion(key, mulberry32(s * 7919 + key.length));
    if (q) all.push(q);
  }
}

// כל הטקסטים החסומים (עובדות pending) — אסור שיופיעו בשאלה, בתשובה או בהסבר
const blockedTexts: string[] = [];
for (const d of DISHES) {
  if (d.waiter?.status === "pending") blockedTexts.push(d.waiter.value);
  for (const h of d.hand) if (h.status === "pending") blockedTexts.push(h.text);
  for (const v of d.variants) if (v.status === "pending") blockedTexts.push(v.detail);
}

const textOf = (q: Question) =>
  [q.prompt, q.explanation, ...q.options.map((o) => o.text), ...(q.parts ?? []).map((p) => p.label)].join("\n");

describe("מנוע השאלות", () => {
  it("כל מפתח מייצר שאלה תקינה", () => {
    const failing = allKeys().filter((k) => !makeQuestion(k, mulberry32(1)));
    expect(failing).toEqual([]);
    expect(all.length).toBeGreaterThan(2000);
  });

  it("לכל שאלה יש לפחות שתי אפשרויות שונות ותשובה נכונה שקיימת", () => {
    for (const q of all) {
      if (q.parts) {
        for (const p of q.parts) expect(p.options.map((o) => o.id)).toContain(p.correct);
        continue;
      }
      expect(q.options.length, q.key).toBeGreaterThanOrEqual(2);
      expect(new Set(q.options.map((o) => o.text)).size, q.key).toBe(q.options.length);
      expect(q.correct.length, q.key).toBeGreaterThanOrEqual(q.multi ? 0 : 1);
      if (!q.multi) expect(q.correct).toHaveLength(1);
      for (const c of q.correct) expect(q.options.map((o) => o.id), q.key).toContain(c);
      expect(q.sources.length, q.key).toBeGreaterThan(0);
    }
  });

  it("אף עובדה חסומה לא דולפת לשאלות", () => {
    for (const q of all) {
      const t = textOf(q);
      for (const b of blockedTexts) expect(t.includes(b), `${q.key} כולל טקסט חסום: ${b}`).toBe(false);
      for (const s of q.sources) {
        // מקור של שדה חסום לא יכול להיות מקור של שאלה (כמה מנות יכולות לחלוק עמוד)
        const fields = DISHES.filter((x) => x.page === s.page).flatMap((d) => [d.gluten, d.dairy, d.allergens, d.spice, d.waiter, d.msg, d.strong]);
        // אותו נוסח בדיוק יכול להופיע גם בשדה מאושר (למשל ״ללא״) — אז אין דליפה
        const approvedQuotes = new Set(fields.filter((f) => f && f.status === "approved").map((f) => f!.src.quote));
        for (const f of fields) {
          if (f && f.status === "pending" && !approvedQuotes.has(f.src.quote))
            expect(s.quote === f.src.quote && s.page === f.src.page, `${q.key}`).toBe(false);
        }
      }
    }
  });

  it("תשובות נכונות מאומתות מול המקור", () => {
    for (const q of all) {
      const correctText = q.options.find((o) => o.id === q.correct[0])?.text ?? "";
      const d = DISH_BY_ID.get(q.dishIds[0])!;
      switch (q.kind) {
        case "ing-in":
          expect(inQuote(correctText, d.description.value), q.key).toBe(true);
          for (const o of q.options.filter((o) => o.id !== "c"))
            expect(mentions(allApprovedText(d), o.text), `${q.key}: מסיח ${o.text}`).toBe(false);
          break;
        case "ing-not-in":
          expect(mentions(allApprovedText(d), correctText), q.key).toBe(false);
          for (const o of q.options.filter((o) => o.id !== "c")) expect(inQuote(o.text, d.description.value)).toBe(true);
          break;
        case "ing-to-dish":
        case "waiter-to-dish":
        case "image-to-dish":
          expect(correctText).toBe(d.name.value);
          break;
        case "waiter-pick":
          expect(correctText).toBe(d.waiter!.value);
          expect(d.waiter!.status).toBe("approved");
          break;
        case "waiter-point":
          expect(inQuote(correctText, d.waiter!.value), q.key).toBe(true);
          break;
        case "gluten-status": {
          const st = glutenStatus(d);
          expect(st).not.toBe("pending");
          const expected = { contains: "מכילה גלוטן", free: "לא מכילה גלוטן", unknown: "לא מצוין בחוברת — צריך לבדוק מול המטבח" }[st as "contains"];
          expect(correctText, q.key).toBe(expected);
          break;
        }
        case "dairy-reply":
          expect(dairyStatus(d)).not.toBe("pending");
          break;
        case "spice-level":
          expect(d.spice!.src.quote).toContain(correctText);
          break;
        case "celiac-reply":
          expect(correctText).toContain("אבדוק מול המטבח");
          break;
        case "allergen-listed":
          expect(d.allergens!.status).toBe("approved");
          expect(d.allergens!.value).toContain(correctText);
          break;
      }
    }
  });

  it("בשאלות בטיחות אף תשובה נכונה לא טוענת ל״בטוח לגמרי״", () => {
    for (const q of all.filter((x) => x.safety)) {
      const texts = q.parts
        ? q.parts.map((p) => p.options.find((o) => o.id === p.correct)!.text)
        : q.options.filter((o) => q.correct.includes(o.id)).map((o) => o.text);
      for (const t of texts) expect(t).not.toMatch(/בטוח/);
    }
  });

  it("חלוקת שאלות הבסיס: 30% תיאור, 30% משפט מלצרית, 40% שווה ביתר", () => {
    const w = baseWeights();
    expect(w.description).toBeCloseTo(0.3);
    expect(w.waiter).toBeCloseTo(0.3);
    const rest = Object.entries(w).filter(([a, v]) => a !== "description" && a !== "waiter" && v > 0);
    expect(rest.length).toBeGreaterThanOrEqual(8);
    const vals = rest.map(([, v]) => v);
    expect(Math.max(...vals) - Math.min(...vals)).toBeLessThan(1e-9);
    const rng = mulberry32(42);
    const n = 20000;
    const count: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const a = pickArea(rng);
      count[a] = (count[a] ?? 0) + 1;
    }
    expect(count.description / n).toBeGreaterThan(0.28);
    expect(count.description / n).toBeLessThan(0.32);
    expect(count.waiter / n).toBeGreaterThan(0.28);
    expect(count.waiter / n).toBeLessThan(0.32);
  });

  it("כיסוי: כל מנה מופיעה בשאלות, ולכל מצב יש תבניות", () => {
    const seen = new Set(all.flatMap((q) => q.dishIds));
    for (const d of DISHES) expect(seen.has(d.id), d.id).toBe(true);
    const kinds = new Set(TEMPLATES.map((t) => t.kind));
    for (const k of ["image-to-dish", "ing-to-dish", "waiter-to-dish", "gluten-odd", "spice-compare", "change-yes", "celiac-reply", "sc-order", "sc-gluten", "sc-vegan", "sc-veggie", "sc-mild"])
      expect(kinds.has(k), k).toBe(true);
  });

  it("מנות שחסומות בשדה מסוים לא נשאלות על השדה הזה", () => {
    const keys = allKeys();
    for (const s of SPECS) {
      if (s.block?.gluten) expect(keys).not.toContain(`gluten-status:${s.id}`);
      if (s.block?.waiter) {
        expect(keys).not.toContain(`waiter-pick:${s.id}`);
        expect(keys).not.toContain(`waiter-to-dish:${s.id}`);
      }
      if (s.block?.allergens) expect(keys).not.toContain(`allergen-listed:${s.id}`);
      if (s.block?.dairy) expect(keys).not.toContain(`dairy-reply:${s.id}`);
      if (s.block?.spice) expect(keys).not.toContain(`spice-level:${s.id}`);
    }
  });
});
