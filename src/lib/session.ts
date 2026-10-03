// בניית סבב תרגול לפי מצב לימוד.

import { DISH_BY_ID } from "@/data/menu";
import { allKeys, BASE_AREAS, pickArea, pick, shuffle, templateOf, type Area, type Rng } from "./quiz";
import { mistakeKeys, safetyFocusKeys, seenCount, type ProgressData } from "./progress-core";

export type Mode = "mixed" | "daily" | "image" | "dish" | "reverse" | "scenario" | "mistakes" | "safety" | "exam";

export const MODE_INFO: Record<Mode, { title: string; desc: string; size: number }> = {
  mixed: { title: "תרגול חופשי", desc: "שאלות בסיס מכל התחומים, עם דגש על תיאור המנה ומשפט המלצרית", size: 15 },
  daily: { title: "תרגול יומי קצר", desc: "10 שאלות: חזרה על טעויות ושאלות שעוד לא ראית", size: 10 },
  image: { title: "זיהוי לפי תמונה", desc: "רואים איור של מנה, מזהים אותה ועונים עליה", size: 12 },
  dish: { title: "מנה אחת לעומק", desc: "בוחרים מנה ועוברים על כל מה שידוע עליה", size: 12 },
  reverse: { title: "שאלות הפוכות והשוואות", desc: "ממרכיבים ומשפט מלצרית למנה, השוואה בין מנות, איזו לא מתאימה", size: 12 },
  scenario: { title: "תרחישי אורח", desc: "גלוטן, טבעונות, צמחונות, אלרגיות, חריפות וסימולציית הזמנה", size: 10 },
  mistakes: { title: "חזרה על טעויות", desc: "רק שאלות שטעית בהן בפעם האחרונה", size: 20 },
  safety: { title: "תרגול ממוקד: אלרגיות וגלוטן", desc: "טעויות בנושאי בטיחות חוזרות כאן עד שעונים נכון פעמיים", size: 15 },
  exam: { title: "מבחן מדמה", desc: "25 שאלות, 15 דקות, ציון בסוף", size: 25 },
};

export const dishOfKey = (key: string): string | null => {
  const param = key.slice(key.indexOf(":") + 1).split("|")[0];
  return DISH_BY_ID.has(param) ? param : null;
};

const keysByArea = new Map<Area, string[]>();
function areaKeys(a: Area): string[] {
  if (!keysByArea.has(a)) keysByArea.set(a, allKeys((t) => t.area === a));
  return keysByArea.get(a)!;
}

/** מעדיף שאלות שנראו פחות פעמים */
function leastSeen(keys: string[], seen: Map<string, number>, rng: Rng): string {
  const min = Math.min(...keys.map((k) => seen.get(k) ?? 0));
  return pick(keys.filter((k) => (seen.get(k) ?? 0) <= min + 1), rng);
}

function baseKeys(n: number, p: ProgressData, rng: Rng, exclude = new Set<string>()): string[] {
  const seen = seenCount(p);
  const out: string[] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    const pool = areaKeys(pickArea(rng)).filter((k) => !exclude.has(k) && !out.includes(k));
    if (pool.length) out.push(leastSeen(pool, seen, rng));
  }
  return out;
}

/**
 * שאלות בטיחות שטעו בהן מתווספות *מעבר* לחלוקת הבסיס (כל שאלה רביעית בערך),
 * כך שהחלוקה של שאלות הבסיס לא משתנה.
 */
function withSafetyFocus(keys: string[], p: ProgressData, rng: Rng): string[] {
  const focus = shuffle(safetyFocusKeys(p), rng).filter((k) => !keys.includes(k));
  if (!focus.length) return keys;
  const out: string[] = [];
  keys.forEach((k, i) => {
    out.push(k);
    if (i % 4 === 3 && focus.length) out.push(focus.shift()!);
  });
  return out;
}

export function buildSession(mode: Mode, p: ProgressData, rng: Rng, dishId?: string): string[] {
  const n = MODE_INFO[mode].size;
  const seen = seenCount(p);
  switch (mode) {
    case "mixed":
      return withSafetyFocus(baseKeys(n, p, rng), p, rng);
    case "daily": {
      const mistakes = mistakeKeys(p).slice(0, 3);
      return withSafetyFocus([...mistakes, ...baseKeys(n - mistakes.length, p, rng, new Set(mistakes))], p, rng);
    }
    case "exam": {
      const scen = shuffle(allKeys((t) => t.area === "scenario"), rng).slice(0, 5);
      return shuffle([...baseKeys(20, p, rng), ...scen], rng);
    }
    case "image": {
      const imgKeys = shuffle(areaKeys("image"), rng).slice(0, Math.ceil(n / 2));
      const out: string[] = [];
      for (const k of imgKeys) {
        out.push(k);
        const d = dishOfKey(k)!;
        const follow = allKeys((t) => !t.reverse && t.area !== "image" && t.area !== "scenario").filter((x) => dishOfKey(x) === d);
        if (follow.length) out.push(`${leastSeen(follow, seen, rng)}#img`);
      }
      return out;
    }
    case "dish": {
      const id = dishId && DISH_BY_ID.has(dishId) ? dishId : pick([...DISH_BY_ID.keys()], rng);
      const keys = allKeys((t) => t.area !== "scenario" || t.kind === "sc-veggie").filter((k) => dishOfKey(k) === id);
      // קודם תיאור ומשפט מלצרית, אחר כך השאר
      const first = keys.filter((k) => ["description", "waiter"].includes(templateOf(k)!.area));
      const rest = keys.filter((k) => !first.includes(k));
      return [...shuffle(first, rng), ...shuffle(rest, rng)].slice(0, 16);
    }
    case "reverse":
      return shuffle(allKeys((t) => !!t.reverse), rng).slice(0, n);
    case "scenario": {
      const sc = allKeys((t) => t.area === "scenario" || t.kind === "celiac-reply" || t.kind === "allergy-guest");
      const fixed = allKeys((t) => ["sc-gluten", "sc-vegan", "sc-mild", "sc-order"].includes(t.kind));
      return shuffle([...shuffle(fixed, rng).slice(0, 4), ...shuffle(sc.filter((k) => !fixed.includes(k)), rng).slice(0, n - 4)], rng);
    }
    case "mistakes":
      return mistakeKeys(p).slice(0, n);
    case "safety": {
      const focus = safetyFocusKeys(p);
      const extra = shuffle(allKeys((t) => ["allergens", "gluten", "dairy"].includes(t.area)), rng).filter((k) => !focus.includes(k));
      return [...focus, ...extra].slice(0, n);
    }
  }
}

export { BASE_AREAS };
