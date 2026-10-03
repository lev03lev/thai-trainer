// מנוע השאלות. משתמש *רק* בעובדות מאושרות (status === "approved").
// כל שאלה נוצרת מ"מפתח" (key) קבוע, כך שאפשר לחזור על אותה שאלה אחרי טעות.

import { DISHES, DISH_BY_ID, ok, allApprovedText, animalWordsIn } from "@/data/menu";
import type { Dish, Source } from "@/data/types";
import { mentions } from "./text";

export type Area =
  | "description"
  | "waiter"
  | "allergens"
  | "gluten"
  | "dairy"
  | "msg"
  | "spice"
  | "changes"
  | "strong"
  | "notes"
  | "image"
  | "scenario";

export const AREA_LABEL: Record<Area, string> = {
  description: "תיאור ומרכיבים",
  waiter: "משפט למלצרית",
  allergens: "אלרגנים",
  gluten: "גלוטן",
  dairy: "מוצרי חלב",
  msg: "MSG",
  spice: "חריפות",
  changes: "שינויים אפשריים",
  strong: "טעמים חזקים",
  notes: "הערות ושירות",
  image: "זיהוי לפי תמונה",
  scenario: "תרחישי אורח",
};

export interface Option {
  id: string;
  text: string;
}

export interface Part {
  label: string;
  options: Option[];
  correct: string;
}

export interface Question {
  key: string;
  kind: string;
  area: Area;
  dishIds: string[];
  prompt: string;
  image?: string;
  options: Option[];
  correct: string[];
  multi: boolean;
  /** סימולציה עם כמה חלקים (כל חלק = בחירה אחת) */
  parts?: Part[];
  explanation: string;
  sources: Source[];
  /** שאלה שנוגעת לאלרגיה / גלוטן / מגבלה רפואית או דתית */
  safety: boolean;
  /** מצבי תרגול שבהם השאלה מתאימה */
  reverse?: boolean;
}

// ---------- אקראיות עם זרע (לבדיקות) ----------
export type Rng = () => number;
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(arr: T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)];
export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const sample = <T,>(arr: T[], n: number, rng: Rng) => shuffle(arr, rng).slice(0, n);

// ---------- עזרים ----------
const name = (d: Dish) => d.name.value;
const pageRef = (s: Source) => `עמ' ${s.page}${s.kind === "handwritten" ? ", כתב יד" : ""}`;

function mc(
  base: Omit<Question, "options" | "correct" | "multi">,
  correctText: string,
  wrongTexts: string[],
  rng: Rng,
): Question | null {
  const wrong = [...new Set(wrongTexts)].filter((w) => w !== correctText);
  if (wrong.length < 1) return null;
  const opts = shuffle(
    [{ id: "c", text: correctText }, ...wrong.slice(0, 3).map((t, i) => ({ id: `w${i}`, text: t }))],
    rng,
  );
  return { ...base, options: opts, correct: ["c"], multi: false };
}

function fixedMc(
  base: Omit<Question, "options" | "correct" | "multi">,
  options: { text: string; correct: boolean }[],
): Question {
  return {
    ...base,
    options: options.map((o, i) => ({ id: `o${i}`, text: o.text })),
    correct: options.flatMap((o, i) => (o.correct ? [`o${i}`] : [])),
    multi: false,
  };
}

const approvedDishes = (f: (d: Dish) => boolean) => DISHES.filter(f);

// ---------- סטטוסים עובדתיים משותפים ----------
export type Tri = "contains" | "free" | "unknown" | "pending";

export function glutenStatus(d: Dish): Tri {
  if (!d.gluten) return "unknown";
  return d.gluten.status === "approved" ? d.gluten.value : "pending";
}
export function dairyStatus(d: Dish): Tri {
  if (!d.dairy) return "unknown";
  return d.dairy.status === "approved" ? d.dairy.value : "pending";
}

const ALLERGEN_WORDS: Record<string, string[]> = {
  בוטנים: ["בוטן"],
  קשיו: ["קשיו"],
  שומשום: ["שומשום"],
  ביצים: ["ביצה", "ביצת", "ביצים", "חלמון"],
};

/** האם לפי החוברת המנה מכילה את האלרגן (ברשימת האלרגיות המאושרת או בתיאור) */
export function allergenStatus(d: Dish, allergen: string): "contains" | "check" {
  if (ok(d.allergens) && d.allergens.value.includes(allergen)) return "contains";
  const words = ALLERGEN_WORDS[allergen] ?? [allergen];
  if (words.some((w) => d.description.value.includes(w))) return "contains";
  return "check";
}

export type VegStatus = { kind: "vegan-version" } | { kind: "animal"; words: string[] } | { kind: "unknown" };
const PROTEIN_CHOICES = ["עוף/טופו/שרימפ/טבעוני", "עוף/טופו/בקר", "עוף/טופו/דג", "דג/טופו"];
export function vegStatus(d: Dish): VegStatus {
  if (d.variants.some((v) => v.vegan && v.status === "approved")) return { kind: "vegan-version" };
  let desc = d.description.value;
  PROTEIN_CHOICES.forEach((c) => (desc = desc.split(c).join(" ")));
  const words = animalWordsIn({ ...d, description: { ...d.description, value: desc } });
  return words.length ? { kind: "animal", words } : { kind: "unknown" };
}

export function spiceMild(d: Dish): boolean | null {
  if (ok(d.spice) && d.spice.value.level !== undefined) return d.spice.value.level <= 2;
  if (d.notes.some((n) => n.status === "approved" && n.value === "לא חריף")) return true;
  return null;
}

// ---------- תבניות ----------
interface Template {
  kind: string;
  area: Area;
  reverse?: boolean;
  keys: () => string[];
  make: (param: string, rng: Rng) => Question | null;
}

const T: Template[] = [];

// ===== תיאור ומרכיבים =====
T.push({
  kind: "ing-in",
  area: "description",
  keys: () => approvedDishes((d) => ok(d.ingredients) && d.ingredients.value.length > 0).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const text = allApprovedText(d);
    const correct = pick(d.ingredients.value, rng);
    const pool = DISHES.filter((o) => o.id !== id && ok(o.ingredients))
      .flatMap((o) => o.ingredients.value)
      .filter((x) => !mentions(text, x));
    return mc(
      {
        key: `ing-in:${id}`,
        kind: "ing-in",
        area: "description",
        dishIds: [id],
        prompt: `איזה מהמרכיבים הבאים מופיע בתיאור של ״${name(d)}״?`,
        explanation: `בתיאור המנה: ״${d.description.value}״`,
        sources: [d.description.src],
        safety: false,
      },
      correct,
      sample([...new Set(pool)], 3, rng),
      rng,
    );
  },
});

T.push({
  kind: "ing-not-in",
  area: "description",
  keys: () => approvedDishes((d) => ok(d.ingredients) && d.ingredients.value.length >= 3).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const text = allApprovedText(d);
    const pool = [
      ...new Set(
        DISHES.filter((o) => o.id !== id && ok(o.ingredients))
          .flatMap((o) => o.ingredients.value)
          .filter((x) => !mentions(text, x)),
      ),
    ];
    if (!pool.length) return null;
    const odd = pick(pool, rng);
    const own = sample(d.ingredients.value, 3, rng);
    return {
      key: `ing-not-in:${id}`,
      kind: "ing-not-in",
      area: "description",
      dishIds: [id],
      prompt: `איזה מהבאים *לא* מופיע בתיאור של ״${name(d)}״ בחוברת?`,
      options: shuffle(
        [{ id: "c", text: odd }, ...own.map((t, i) => ({ id: `w${i}`, text: t }))],
        rng,
      ),
      correct: ["c"],
      multi: false,
      explanation: `״${odd}״ לא מופיע בתיאור. בתיאור המנה: ״${d.description.value}״`,
      sources: [d.description.src],
      safety: false,
    };
  },
});

T.push({
  kind: "ing-to-dish",
  area: "description",
  reverse: true,
  keys: () => approvedDishes((d) => ok(d.ingredients) && d.ingredients.value.length >= 3).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const three = sample(d.ingredients.value, 3, rng);
    const others = DISHES.filter(
      (o) => o.id !== id && three.some((x) => !mentions(allApprovedText(o), x)),
    );
    return mc(
      {
        key: `ing-to-dish:${id}`,
        kind: "ing-to-dish",
        area: "description",
        reverse: true,
        dishIds: [id],
        prompt: `באיזו מנה מופיעים בתיאור כל המרכיבים האלה: ${three.map((x) => `״${x}״`).join(", ")}?`,
        explanation: `״${name(d)}״: ${d.description.value}`,
        sources: [d.description.src],
        safety: false,
      },
      name(d),
      sample(others, 3, rng).map(name),
      rng,
    );
  },
});

// ===== משפט למלצרית =====
// תיאורי טעם כלליים עלולים להיות נכונים גם למנה אחרת — לא משמשים כמסיחים
const TASTE_WORDS = ["חריף", "פיקנט", "מרענ", "עשיר", "מתוק", "מתקתק", "חמוץ", "חמצמץ", "עסיסי", "קלאסי", "סטיקי", "אורז", "עשבוני", "ארומטי", "מנחם", "מתאימה"];
const waiterDishes = () => approvedDishes((d) => ok(d.waiter));

T.push({
  kind: "waiter-pick",
  area: "waiter",
  keys: () => waiterDishes().map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const prompts = [
      `אורח שואל: ״מה זה ${name(d)}?״ — מה מתאים לענות לו?`,
      `איזה תיאור מתאים למנה ״${name(d)}״?`,
    ];
    return mc(
      {
        key: `waiter-pick:${id}`,
        kind: "waiter-pick",
        area: "waiter",
        dishIds: [id],
        prompt: pick(prompts, rng),
        explanation: `משפט התיאור למלצרים: ״${d.waiter!.value}״. אין צורך לשנן מילה במילה — חשוב להעביר את הרעיון.`,
        sources: [d.waiter!.src],
        safety: false,
      },
      d.waiter!.value,
      sample(waiterDishes().filter((o) => o.id !== id), 3, rng).map((o) => o.waiter!.value),
      rng,
    );
  },
});

T.push({
  kind: "waiter-point",
  area: "waiter",
  keys: () => approvedDishes((d) => ok(d.waiter) && ok(d.waiterPoints)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const text = allApprovedText(d);
    const correct = pick(d.waiterPoints!.value, rng);
    const pool = waiterDishes()
      .filter((o) => o.id !== id && ok(o.waiterPoints))
      .flatMap((o) => o.waiterPoints!.value)
      .filter((x) => !mentions(text, x) && !TASTE_WORDS.some((w) => x.includes(w)));
    return mc(
      {
        key: `waiter-point:${id}`,
        kind: "waiter-point",
        area: "waiter",
        dishIds: [id],
        prompt: `מה מהבאים מופיע במשפט התיאור למלצרים של ״${name(d)}״?`,
        explanation: `משפט התיאור למלצרים: ״${d.waiter!.value}״`,
        sources: [d.waiter!.src],
        safety: false,
      },
      correct,
      sample([...new Set(pool)], 3, rng),
      rng,
    );
  },
});

T.push({
  kind: "waiter-to-dish",
  area: "waiter",
  reverse: true,
  keys: () => waiterDishes().map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    return mc(
      {
        key: `waiter-to-dish:${id}`,
        kind: "waiter-to-dish",
        area: "waiter",
        reverse: true,
        dishIds: [id],
        prompt: `לאיזו מנה שייך משפט המלצרים הזה?\n״${d.waiter!.value}״`,
        explanation: `זה משפט התיאור של ״${name(d)}״.`,
        sources: [d.waiter!.src],
        safety: false,
      },
      name(d),
      sample(DISHES.filter((o) => o.id !== id), 3, rng).map(name),
      rng,
    );
  },
});

// ===== תמונה =====
T.push({
  kind: "image-to-dish",
  area: "image",
  reverse: true,
  keys: () => approvedDishes((d) => ok(d.image)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    return mc(
      {
        key: `image-to-dish:${id}`,
        kind: "image-to-dish",
        area: "image",
        reverse: true,
        dishIds: [id],
        prompt: "איזו מנה מופיעה באיור?",
        image: d.image!.value,
        explanation: `זה האיור מעמוד המנה ״${name(d)}״ בחוברת.`,
        sources: [d.image!.src],
        safety: false,
      },
      name(d),
      // בלי שתי מנות הדג בלימון יחד — ייתכן שזו אותה מנה (שאלה פתוחה)
      sample(
        DISHES.filter((o) => o.id !== id && !(["fish-lemon", "pla-manao"].includes(id) && ["fish-lemon", "pla-manao"].includes(o.id))),
        3,
        rng,
      ).map(name),
      rng,
    );
  },
});

// ===== אלרגנים =====
const ALLERGEN_RELATED: Record<string, string[]> = {
  לקטוז: ["חמאה", "חלב", "לקטוז", "גהי"],
  חמאה: ["חמאה", "חלב", "לקטוז", "גהי"],
  גלוטן: ["גלוטן", "קמח", "סויה"],
  ביצים: ["ביצ", "חלמון"],
  צדפות: ["אויסטר", "מולים", "צדפ"],
  אויסטר: ["אויסטר"],
  בוטנים: ["בוטן"],
  קשיו: ["קשיו"],
  שומשום: ["שומשום"],
  שרימפ: ["שרימפ"],
};
const ALL_ALLERGENS = Object.keys(ALLERGEN_RELATED);

T.push({
  kind: "allergen-listed",
  area: "allergens",
  keys: () => approvedDishes((d) => ok(d.allergens)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const listed = d.allergens!.value;
    const text = allApprovedText(d);
    const wrong = ALL_ALLERGENS.filter(
      (a) =>
        !listed.includes(a) &&
        !ALLERGEN_RELATED[a].some((w) => text.includes(w)) &&
        !(a === "גלוטן" && glutenStatus(d) !== "free"),
    );
    return mc(
      {
        key: `allergen-listed:${id}`,
        kind: "allergen-listed",
        area: "allergens",
        dishIds: [id],
        prompt: `איזה אלרגן רשום בחוברת עבור ״${name(d)}״?`,
        explanation: `רשום בשדה האלרגיות: ${listed.join(", ")}. מה שלא רשום לא אומר שהמנה בטוחה — במקרה של אלרגיה תמיד מוודאים מול המטבח.`,
        sources: [d.allergens!.src],
        safety: true,
      },
      pick(listed, rng),
      sample(wrong, 3, rng),
      rng,
    );
  },
});

T.push({
  kind: "allergy-guest",
  area: "allergens",
  keys: () =>
    DISHES.flatMap((d) =>
      Object.keys(ALLERGEN_WORDS)
        // אם רשימת האלרגנים של המנה ממתינה לבירור ואין אזכור בתיאור — לא שואלים
        .filter((a) => !(d.allergens && d.allergens.status === "pending" && allergenStatus(d, a) === "check"))
        .map((a) => `${d.id}|${a}`),
    ),
  make: (param, rng) => {
    const [id, a] = param.split("|");
    const d = DISH_BY_ID.get(id)!;
    const st = allergenStatus(d, a);
    const src = ok(d.allergens) && d.allergens.value.includes(a) ? d.allergens.src : d.description.src;
    const q = fixedMc(
      {
        key: `allergy-guest:${param}`,
        kind: "allergy-guest",
        area: "allergens",
        dishIds: [id],
        prompt: `אורח עם אלרגיה ל${a} שואל על ״${name(d)}״. מה עונים?`,
        explanation:
          st === "contains"
            ? `לפי החוברת יש במנה ${a} (${pageRef(src)}). לא ממליצים עליה לאורח.`
            : `אין בחוברת אזכור של ${a} במנה — אבל זה לא אומר שהיא בטוחה (ייתכן זיהום צולב או מרכיב שלא פורט). עונים שצריך לבדוק מול המטבח.`,
        sources: [src],
        safety: true,
      },
      [
        { text: `המנה מכילה ${a} לפי החוברת — לא להמליץ עליה`, correct: st === "contains" },
        { text: `אין אזכור של ${a} בחוברת — בודקים מול המטבח לפני שממליצים`, correct: st === "check" },
        { text: `המנה בטוחה לגמרי לאלרגיים ל${a}`, correct: false },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

// ===== גלוטן =====
T.push({
  kind: "gluten-status",
  area: "gluten",
  keys: () => DISHES.filter((d) => glutenStatus(d) !== "pending").map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const st = glutenStatus(d);
    const q = fixedMc(
      {
        key: `gluten-status:${id}`,
        kind: "gluten-status",
        area: "gluten",
        dishIds: [id],
        prompt: `לפי החוברת, האם הגרסה הרגילה של ״${name(d)}״ מכילה גלוטן?`,
        explanation:
          st === "unknown"
            ? "בחוברת לא מצוין מצב הגלוטן בגרסה הרגילה. שדה ריק = לא ידוע, ולכן בודקים מול המטבח."
            : `בחוברת, בשדה הגלוטן: ״${d.gluten!.src.quote}״ (${pageRef(d.gluten!.src)}).${st === "free" ? " גם כשכתוב ״ללא גלוטן״ — לצליאק צריך לבדוק זיהום צולב מול המטבח." : ""}${
                d.variants
                  .filter((v) => v.status === "approved" && v.gluten === "free" && v.vegan !== false)
                  .map((v) => ` שימי לב: ${v.label} — ${v.detail}`)
                  .join("") || ""
              }`,
        sources: d.gluten ? [d.gluten.src] : [d.description.src],
        safety: true,
      },
      [
        { text: "מכילה גלוטן", correct: st === "contains" },
        { text: "לא מכילה גלוטן", correct: st === "free" },
        { text: "לא מצוין בחוברת — צריך לבדוק מול המטבח", correct: st === "unknown" },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

T.push({
  kind: "gluten-odd",
  area: "gluten",
  reverse: true,
  keys: () => DISHES.filter((d) => glutenStatus(d) === "contains").map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const free = DISHES.filter((o) => glutenStatus(o) === "free");
    if (free.length < 3) return null;
    return mc(
      {
        key: `gluten-odd:${id}`,
        kind: "gluten-odd",
        area: "gluten",
        reverse: true,
        dishIds: [id],
        prompt: "אורח נמנע מגלוטן. איזו מהמנות הבאות *מכילה* גלוטן לפי החוברת?",
        explanation: `״${name(d)}״ — בשדה הגלוטן: ״${d.gluten!.src.quote}״. שאר המנות מסומנות בחוברת כללא גלוטן (לצליאק עדיין בודקים מול המטבח).`,
        sources: [d.gluten!.src],
        safety: true,
      },
      name(d),
      sample(free, 3, rng).map(name),
      rng,
    );
  },
});

T.push({
  kind: "celiac-reply",
  area: "gluten",
  keys: () => DISHES.filter((d) => glutenStatus(d) === "free").map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const q = fixedMc(
      {
        key: `celiac-reply:${id}`,
        kind: "celiac-reply",
        area: "gluten",
        dishIds: [id],
        prompt: `אורחת עם צליאק שואלת על ״${name(d)}״. מה התשובה הנכונה?`,
        explanation: `בחוברת כתוב: ״${d.gluten!.src.quote}״. החוברת לא מתייחסת לזיהום צולב${d.id === "num-khao-tod" ? " (ובמנה הזו אף כתוב שכדורי האורז מטוגנים בשמן שאינו סטרילי)" : ""} — לכן לצליאק תמיד בודקים מול המטבח.`,
        sources: [d.gluten!.src],
        safety: true,
      },
      [
        { text: "לפי החוברת המנה ללא גלוטן, אבל לגבי צליאק (זיהום צולב) אבדוק מול המטבח", correct: true },
        { text: "המנה בטוחה לצליאק, אין בה גלוטן", correct: false },
        { text: "המנה מכילה גלוטן", correct: false },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

// ===== מוצרי חלב =====
T.push({
  kind: "dairy-reply",
  area: "dairy",
  keys: () => DISHES.filter((d) => dairyStatus(d) !== "pending").map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const st = dairyStatus(d);
    const q = fixedMc(
      {
        key: `dairy-reply:${id}`,
        kind: "dairy-reply",
        area: "dairy",
        dishIds: [id],
        prompt: `אורח שואל אם יש מוצרי חלב ב״${name(d)}״. איזו תשובה נכונה?`,
        explanation:
          st === "unknown"
            ? "בחוברת לא מצוין אם יש במנה מוצרי חלב — שדה ריק = לא ידוע."
            : `בחוברת, בשדה מוצרי חלב: ״${d.dairy!.src.quote}״ (${pageRef(d.dairy!.src)}).`,
        sources: d.dairy ? [d.dairy.src] : [d.description.src],
        safety: true,
      },
      [
        { text: "כן, לפי החוברת יש במנה מוצרי חלב", correct: st === "contains" },
        { text: "לפי החוברת אין מוצרי חלב — אם זו אלרגיה, אוודא מול המטבח", correct: st === "free" },
        { text: "זה לא מצוין בחוברת — אבדוק מול המטבח", correct: st === "unknown" },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

T.push({
  kind: "dairy-compare",
  area: "dairy",
  reverse: true,
  keys: () => DISHES.filter((d) => dairyStatus(d) === "contains").map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const free = DISHES.filter((o) => dairyStatus(o) === "free");
    const other = pick(free, rng);
    const q = fixedMc(
      {
        key: `dairy-compare:${id}`,
        kind: "dairy-compare",
        area: "dairy",
        reverse: true,
        dishIds: [id, other.id],
        prompt: `השוואה: איזו משתי המנות מכילה מוצרי חלב לפי החוברת?`,
        explanation: `״${name(d)}״: ״${d.dairy!.src.quote}״. ״${name(other)}״: ״${other.dairy!.src.quote}״.`,
        sources: [d.dairy!.src, other.dairy!.src],
        safety: true,
      },
      [
        { text: name(d), correct: true },
        { text: name(other), correct: false },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

// ===== MSG =====
T.push({
  kind: "msg",
  area: "msg",
  keys: () => approvedDishes((d) => ok(d.msg)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const m = d.msg!.value;
    const opts =
      m.removable === undefined
        ? [
            { text: "יש MSG", correct: m.has },
            { text: "אין MSG", correct: !m.has },
          ]
        : [
            { text: "אין MSG", correct: false },
            { text: "יש MSG, ואפשר להוציא", correct: m.removable === true },
            { text: "יש MSG, ואי אפשר להוציא", correct: m.removable === false },
          ];
    const q = fixedMc(
      {
        key: `msg:${id}`,
        kind: "msg",
        area: "msg",
        dishIds: [id],
        prompt: `מה כתוב בחוברת לגבי MSG ב״${name(d)}״?`,
        explanation: `בשדה MSG: ״${d.msg!.src.quote}״ (${pageRef(d.msg!.src)}).`,
        sources: [d.msg!.src],
        safety: false,
      },
      opts,
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

// ===== חריפות =====
const numericSpice = () => approvedDishes((d) => ok(d.spice) && d.spice.value.level !== undefined);
const fmtLevel = (n: number) => `${n}/10`;

T.push({
  kind: "spice-level",
  area: "spice",
  keys: () => numericSpice().map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const lvl = d.spice!.value.level!;
    const others = [...new Set(numericSpice().map((o) => o.spice!.value.level!))].filter((l) => l !== lvl);
    return mc(
      {
        key: `spice-level:${id}`,
        kind: "spice-level",
        area: "spice",
        dishIds: [id],
        prompt: `מה רמת החריפות של ״${name(d)}״ לפי החוברת?`,
        explanation: `בשדה רמת חריפות: ״${d.spice!.src.quote}״.`,
        sources: [d.spice!.src],
        safety: false,
      },
      fmtLevel(lvl),
      sample(others, 3, rng).map(fmtLevel),
      rng,
    );
  },
});

T.push({
  kind: "spice-compare",
  area: "spice",
  reverse: true,
  keys: () => numericSpice().map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const lvl = d.spice!.value.level!;
    const others = numericSpice().filter((o) => Math.abs(o.spice!.value.level! - lvl) >= 2);
    if (!others.length) return null;
    const o = pick(others, rng);
    const hotter = o.spice!.value.level! > lvl ? o : d;
    const q = fixedMc(
      {
        key: `spice-compare:${id}`,
        kind: "spice-compare",
        area: "spice",
        reverse: true,
        dishIds: [d.id, o.id],
        prompt: "השוואה: איזו משתי המנות חריפה יותר לפי החוברת?",
        explanation: `״${name(d)}״: ${fmtLevel(lvl)}. ״${name(o)}״: ${fmtLevel(o.spice!.value.level!)}.`,
        sources: [d.spice!.src, o.spice!.src],
        safety: false,
      },
      [
        { text: name(d), correct: hotter === d },
        { text: name(o), correct: hotter === o },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

// ===== שינויים אפשריים =====
T.push({
  kind: "change-yes",
  area: "changes",
  keys: () => approvedDishes((d) => d.changesYes.some(ok) && d.changesNo.some(ok)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const yes = d.changesYes.filter(ok);
    const c = pick(yes, rng);
    const q: Question | null = mc(
      {
        key: `change-yes:${id}`,
        kind: "change-yes",
        area: "changes",
        dishIds: [id],
        prompt: `אורח רוצה לשנות משהו ב״${name(d)}״. איזה שינוי מופיע בחוברת כאפשרי?`,
        explanation: `בשדה השינויים: ״${c.src.quote}״. שינוי שלא מופיע בחוברת — בודקים מול המטבח.`,
        sources: [c.src],
        safety: false,
      },
      c.value,
      // מסיחים: רק מה שהחוברת אומרת במפורש שאי אפשר במנה הזו
      d.changesNo.filter(ok).map((n) => n.value),
      rng,
    );
    return q;
  },
});

T.push({
  kind: "change-no",
  area: "changes",
  keys: () => approvedDishes((d) => d.changesNo.some(ok) && d.changesYes.some(ok)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const n = pick(d.changesNo.filter(ok), rng);
    return mc(
      {
        key: `change-no:${id}`,
        kind: "change-no",
        area: "changes",
        dishIds: [id],
        prompt: `מה מהבאים *לא* אפשרי ב״${name(d)}״ לפי החוברת?`,
        explanation: `בשדה השינויים: ״${n.src.quote}״.`,
        sources: [n.src],
        safety: false,
      },
      n.value,
      d.changesYes.filter(ok).map((y) => y.value),
      rng,
    );
  },
});

// ===== טעמים חזקים =====
const GENERIC_STRONG = new Set(["כן", "טעים"]);
const strongDishes = () => approvedDishes((d) => ok(d.strong) && !GENERIC_STRONG.has(d.strong.value));
T.push({
  kind: "strong",
  area: "strong",
  keys: () => strongDishes().map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    return mc(
      {
        key: `strong:${id}`,
        kind: "strong",
        area: "strong",
        dishIds: [id],
        prompt: `מה כתוב בחוברת בשדה ״טעמים חזקים״ של ״${name(d)}״?`,
        explanation: `״${d.strong!.value}״ (${pageRef(d.strong!.src)}).`,
        sources: [d.strong!.src],
        safety: false,
      },
      d.strong!.value,
      sample(
        strongDishes().filter((o) => o.id !== id && o.strong!.value !== d.strong!.value),
        3,
        rng,
      ).map((o) => o.strong!.value),
      rng,
    );
  },
});

// ===== הערות ושירות =====
T.push({
  kind: "note",
  area: "notes",
  keys: () => approvedDishes((d) => d.notes.some(ok)).map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const text = allApprovedText(d);
    const n = pick(d.notes.filter(ok), rng);
    const pool = DISHES.filter((o) => o.id !== id)
      .flatMap((o) => o.notes.filter(ok).map((x) => x.value))
      .filter((x) => !mentions(text, x) && !TASTE_WORDS.some((w) => x.includes(w)));
    return mc(
      {
        key: `note:${id}`,
        kind: "note",
        area: "notes",
        dishIds: [id],
        prompt: `איזו הערה מופיעה בחוברת לגבי ״${name(d)}״?`,
        explanation: `בחוברת: ״${n.src.quote}״ (${pageRef(n.src)}).`,
        sources: [n.src],
        safety: false,
      },
      n.value,
      sample([...new Set(pool)], 3, rng),
      rng,
    );
  },
});

const WIPES = () => DISHES.filter((d) => d.hand.some((h) => h.field === "service" && h.status === "approved" && h.text.includes("מגבונים")));
T.push({
  kind: "wipes",
  area: "notes",
  keys: () => ["all"],
  make: (_p, rng) => {
    const yes = WIPES();
    const no = sample(DISHES.filter((d) => !yes.includes(d)), 3, rng);
    const opts = shuffle([...yes, ...no], rng);
    return {
      key: "wipes:all",
      kind: "wipes",
      area: "notes",
      dishIds: yes.map((d) => d.id),
      prompt: "לצד אילו מנות מגישים צלחת מגבונים? (סמני את כל התשובות הנכונות)",
      options: opts.map((d) => ({ id: d.id, text: name(d) })),
      correct: yes.map((d) => d.id),
      multi: true,
      explanation: `לפי הערות בכתב יד בחוברת: ${yes.map((d) => `״${name(d)}״ (עמ' ${d.page})`).join(", ")}.`,
      sources: yes.map((d) => d.hand.find((h) => h.field === "service")!.src),
      safety: false,
    };
  },
});

T.push({
  kind: "kosher-word",
  area: "notes",
  keys: () => ["p9"],
  make: (_p, rng) => {
    const d = DISH_BY_ID.get("peek-gai-tod")!;
    const h = d.hand.find((x) => x.text.includes("כשר"))!;
    const q = fixedMc(
      {
        key: "kosher-word:p9",
        kind: "kosher-word",
        area: "notes",
        dishIds: [d.id],
        prompt: "מה ההנחיה בחוברת לגבי המילה ״כשר״?",
        explanation: "בעמ' 9 (כנפי עוף), בכתב יד: ״לא להשתמש במילה כשר!״. מה עונים לאורח ששואל על כשרות — ממתין להגדרה ממך (ראי עמוד הבירורים).",
        sources: [h.src],
        safety: true,
      },
      [
        { text: "לא להשתמש במילה ״כשר״", correct: true },
        { text: "לומר שהמנות כשרות אם אין בהן חזיר", correct: false },
        { text: "לומר שרק הכנפיים לא כשרות", correct: false },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

T.push({
  kind: "share-fact",
  area: "notes",
  keys: () => ["p24"],
  make: (_p, rng) => {
    const d = DISH_BY_ID.get("pla-red")!;
    return mc(
      {
        key: "share-fact:p24",
        kind: "share-fact",
        area: "notes",
        dishIds: [d.id],
        prompt: "איזו מנה מתוארת בחוברת *במפורש* כ״מנה שמתאימה לחלוקה בתחילת הארוחה״?",
        explanation: `משפט המלצרים של ״${name(d)}״: ״${d.waiter!.value}״.`,
        sources: [d.waiter!.src],
        safety: false,
      },
      name(d),
      sample(DISHES.filter((o) => o.id !== d.id), 3, rng).map(name),
      rng,
    );
  },
});

// ===== תרחישי אורח =====
function subsetScenario(
  key: string,
  prompt: string,
  rng: Rng,
  classify: (d: Dish) => "yes" | "no" | "skip",
  why: (d: Dish) => string,
  safety: boolean,
): Question | null {
  const yes = DISHES.filter((d) => classify(d) === "yes");
  const no = DISHES.filter((d) => classify(d) === "no");
  if (yes.length < 2 || no.length < 3) return null;
  const chosen = shuffle([...sample(yes, Math.min(3, yes.length), rng), ...sample(no, 5, rng)], rng);
  return {
    key,
    kind: key.split(":")[0],
    area: "scenario",
    dishIds: chosen.map((d) => d.id),
    prompt,
    options: chosen.map((d) => ({ id: d.id, text: name(d) })),
    correct: chosen.filter((d) => classify(d) === "yes").map((d) => d.id),
    multi: true,
    explanation: chosen.map((d) => `• ${name(d)} — ${why(d)}`).join("\n"),
    sources: chosen.map((d) => d.description.src),
    safety,
  };
}

T.push({
  kind: "sc-gluten",
  area: "scenario",
  keys: () => ["1"],
  make: (_p, rng) =>
    subsetScenario(
      "sc-gluten:1",
      "אורח עם רגישות לגלוטן (לא צליאק). סמני את כל המנות שהחוברת מציינת שהגרסה הרגילה שלהן ללא גלוטן.",
      rng,
      (d) => (glutenStatus(d) === "free" ? "yes" : glutenStatus(d) === "pending" ? "skip" : "no"),
      (d) => {
        const s = glutenStatus(d);
        return s === "free"
          ? `ללא גלוטן לפי החוברת (״${d.gluten!.src.quote}״)`
          : s === "contains"
            ? `מכילה גלוטן (״${d.gluten!.src.quote}״)`
            : "לא מצוין בחוברת — לבדוק מול המטבח";
      },
      true,
    ),
});

T.push({
  kind: "sc-vegan",
  area: "scenario",
  keys: () => ["1"],
  make: (_p, rng) =>
    subsetScenario(
      "sc-vegan:1",
      "אורחת טבעונית. סמני את המנות שהחוברת מציינת שיש להן גרסה טבעונית.",
      rng,
      (d) => (vegStatus(d).kind === "vegan-version" ? "yes" : "no"),
      (d) => {
        const v = vegStatus(d);
        if (v.kind === "vegan-version") {
          const vv = d.variants.find((x) => x.vegan && x.status === "approved")!;
          return `יש גרסה טבעונית: ${vv.detail}${vv.gluten === "contains" ? " (שימי לב: הגרסה הטבעונית מכילה גלוטן)" : ""}`;
        }
        if (v.kind === "animal") return `לא מצוינת גרסה טבעונית; בתיאור: ${v.words.join(", ")}`;
        return "לא מצוינת גרסה טבעונית — לבדוק מול המטבח";
      },
      true,
    ),
});

T.push({
  kind: "sc-mild",
  area: "scenario",
  keys: () => ["1"],
  make: (_p, rng) =>
    subsetScenario(
      "sc-mild:1",
      "אורח שנמנע מחריף. סמני את המנות שדירוג החריפות שלהן בחוברת הוא 2/10 ומטה, או שכתוב עליהן במפורש ״לא חריף״.",
      rng,
      (d) => {
        const m = spiceMild(d);
        if (m === true) return "yes";
        if (m === false) return "no";
        // אין מידע: לא לסמן. אבל לא נציג מנות שהחריפות שלהן ממתינה לבירור
        return d.spice && d.spice.status === "pending" ? "skip" : "no";
      },
      (d) => {
        if (ok(d.spice)) return `חריפות: ״${d.spice.src.quote}״`;
        if (spiceMild(d)) return "כתוב ״לא חריף״";
        return "אין דירוג חריפות בחוברת — לבדוק מול המטבח";
      },
      false,
    ),
});

T.push({
  kind: "sc-veggie",
  area: "scenario",
  keys: () => DISHES.map((d) => d.id),
  make: (id, rng) => {
    const d = DISH_BY_ID.get(id)!;
    const v = vegStatus(d);
    const q = fixedMc(
      {
        key: `sc-veggie:${id}`,
        kind: "sc-veggie",
        area: "scenario",
        dishIds: [id],
        prompt: `אורחת צמחונית שואלת על ״${name(d)}״. מה עונים?`,
        explanation:
          v.kind === "vegan-version"
            ? "בחוברת מצוינת גרסה טבעונית — ולכן היא גם צמחונית."
            : v.kind === "animal"
              ? `בתיאור המנה מופיע: ${v.words.join(", ")} — כך שכמו שהיא, המנה לא צמחונית.`
              : "החוברת לא מציינת אם המנה צמחונית, וזה לא נקבע רק כי לא כתוב בה בשר — בודקים מול המטבח.",
        sources: [d.description.src],
        safety: true,
      },
      [
        { text: "יש לה גרסה טבעונית — מתאימה", correct: v.kind === "vegan-version" },
        { text: "כמו שהיא לא מתאימה — יש בה מוצר מן החי", correct: v.kind === "animal" },
        { text: "לא מצוין בחוברת — צריך לבדוק מול המטבח", correct: v.kind === "unknown" },
      ],
    );
    q.options = shuffle(q.options, rng);
    return q;
  },
});

T.push({
  kind: "sc-order",
  area: "scenario",
  keys: () => ["gluten", "peanuts", "dairy"],
  make: (constraint, rng) => {
    const st = (d: Dish): "contains" | "free" | "check" | "skip" => {
      if (constraint === "gluten") {
        const s = glutenStatus(d);
        return s === "pending" ? "skip" : s === "unknown" ? "check" : s;
      }
      if (constraint === "dairy") {
        const s = dairyStatus(d);
        return s === "pending" ? "skip" : s === "unknown" ? "check" : s;
      }
      if (d.allergens && d.allergens.status === "pending" && allergenStatus(d, "בוטנים") === "check") return "skip";
      return allergenStatus(d, "בוטנים");
    };
    const pool = DISHES.filter((d) => st(d) !== "skip");
    const dishes = sample(pool, 3, rng);
    const label =
      constraint === "gluten" ? "רגישות לגלוטן" : constraint === "dairy" ? "נמנע ממוצרי חלב" : "אלרגיה לבוטנים";
    const opts: Option[] =
      constraint === "peanuts"
        ? [
            { id: "contains", text: "מכילה בוטנים — לא להגיש" },
            { id: "check", text: "אין אזכור בחוברת — לבדוק במטבח" },
          ]
        : [
            { id: "contains", text: "מכילה לפי החוברת" },
            { id: "free", text: "לא מכילה לפי החוברת" },
            { id: "check", text: "לא מצוין — לבדוק במטבח" },
          ];
    return {
      key: `sc-order:${constraint}`,
      kind: "sc-order",
      area: "scenario",
      dishIds: dishes.map((d) => d.id),
      prompt: `סימולציית הזמנה: שולחן מזמין שלוש מנות. לאחד הסועדים ${label}. מה נכון לגבי כל מנה?`,
      options: [],
      correct: [],
      multi: false,
      parts: dishes.map((d) => ({ label: name(d), options: opts, correct: st(d) })),
      explanation: dishes
        .map((d) => {
          const s = st(d);
          const t = s === "contains" ? "מכילה" : s === "free" ? "לא מכילה לפי החוברת" : "לא מצוין — לבדוק במטבח";
          return `• ${name(d)} — ${t}`;
        })
        .join("\n") +
        (constraint === "peanuts" ? "\nבאלרגיה אף פעם לא אומרים ״בטוח״ רק כי משהו לא כתוב." : ""),
      sources: dishes.map((d) => d.description.src),
      safety: true,
    };
  },
});

// ---------- API ----------
export const TEMPLATES = T;
const BY_KIND = new Map(T.map((t) => [t.kind, t]));

export function allKeys(filter?: (t: Template) => boolean): string[] {
  return T.filter((t) => !filter || filter(t)).flatMap((t) => t.keys().map((k) => `${t.kind}:${k}`));
}

export function templateOf(key: string) {
  return BY_KIND.get(key.slice(0, key.indexOf(":")));
}

export function makeQuestion(key: string, rng: Rng = Math.random): Question | null {
  const i = key.indexOf(":");
  const t = BY_KIND.get(key.slice(0, i));
  if (!t) return null;
  const q = t.make(key.slice(i + 1), rng);
  if (!q) return null;
  return { ...q, key };
}

export function isCorrect(q: Question, chosen: string[], partAnswers?: string[]): boolean {
  if (q.parts) return q.parts.every((p, i) => partAnswers?.[i] === p.correct);
  const a = [...chosen].sort().join(",");
  const b = [...q.correct].sort().join(",");
  return a === b;
}

// ---------- חלוקת שאלות הבסיס ----------
/** 60% לתיאור+משפט מלצרית (חצי-חצי), 40% שווה בין שאר התחומים המאומתים */
export const BASE_AREAS: Area[] = ["description", "waiter", "allergens", "gluten", "dairy", "msg", "spice", "changes", "strong", "notes", "image"];

let _weights: Record<Area, number> | null = null;
export function baseWeights(): Record<Area, number> {
  if (_weights) return _weights;
  const others = BASE_AREAS.filter((a) => a !== "description" && a !== "waiter" && allKeys((t) => t.area === a).length > 0);
  const w = {} as Record<Area, number>;
  BASE_AREAS.forEach((a) => (w[a] = 0));
  w.description = 0.3;
  w.waiter = 0.3;
  others.forEach((a) => (w[a] = 0.4 / others.length));
  w.scenario = 0;
  _weights = w;
  return w;
}

export function pickArea(rng: Rng, weights = baseWeights()): Area {
  let x = rng();
  for (const [a, v] of Object.entries(weights) as [Area, number][]) {
    if ((x -= v) <= 0) return a;
  }
  return "description";
}
