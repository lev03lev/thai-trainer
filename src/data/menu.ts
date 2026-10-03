import { SPECS, type DishSpec } from "./menu-spec";
import type { Dish, Fact, FieldKey, Source, Status } from "./types";

const H = (page: number, quote: string): Source => ({ page, kind: "handwritten", quote });

function srcFor(s: DishSpec, field: FieldKey, quote: string): Source {
  const hand = s.kind === "handwritten" || s.hwFields?.includes(field);
  return { page: s.page, kind: hand ? "handwritten" : "printed", quote };
}

function fact<T>(s: DishSpec, field: FieldKey, value: T, quote: string): Fact<T> {
  const issue = s.block?.[field];
  const status: Status = issue ? "pending" : "approved";
  const src = srcFor(s, field, quote);
  return issue ? { value, src, status, issue } : { value, src, status };
}

const handFact = (s: DishSpec, value: string): Fact<string> => ({ value, src: H(s.page, value), status: "approved" });

/** "-" או מחרוזת ריקה = השדה לא מולא בחוברת → לא ידוע */
const filled = (t?: string) => t !== undefined && t.trim() !== "" && t.trim() !== "-";

export function buildDish(s: DishSpec): Dish {
  const d: Dish = {
    id: s.id,
    page: s.page,
    name: fact(s, "name", s.name, s.name),
    latin: s.latin ? fact(s, "latin", s.latin, s.latin) : undefined,
    aka: s.aka ? handFact(s, s.aka) : undefined,
    handwrittenDish: s.kind === "handwritten" || undefined,
    image: s.noImage
      ? undefined
      : fact(s, "image", `/dishes/p${String(s.page).padStart(2, "0")}.jpg`, "איור המנה בעמוד המנה בחוברת"),
    description: fact(s, "description", s.desc, s.desc),
    ingredients: fact(s, "ingredients", s.ing, s.desc),
    changesYes: [
      ...(s.yes ?? []).map((t) => fact(s, "changes", t, s.changes ?? "")),
      ...(s.yesH ?? []).map((t) => handFact(s, t)),
    ],
    changesNo: [
      ...(s.no ?? []).map((t) => fact(s, "changes", t, s.changes ?? "")),
      ...(s.noH ?? []).map((t) => handFact(s, t)),
    ],
    notes: [
      ...(s.notesItems ?? []).map((t) => fact(s, "notes", t, s.notes ?? "")),
      // הערות בכתב יד שאושרו (שדה "notes") נלמדות כהערות רגילות
      ...(s.hand ?? []).filter((h) => h.field === "notes" && !h.issue).map((h) => handFact(s, h.text)),
    ],
    variants: (s.variants ?? []).map((v) => ({
      label: v.label,
      vegan: v.vegan,
      gluten: v.gluten,
      detail: v.detail,
      src: { page: s.page, kind: v.kind ?? "printed", quote: v.quote },
      status: v.issue ? "pending" : "approved",
      issue: v.issue,
    })),
    hand: (s.hand ?? []).map((h) => ({
      field: h.field,
      text: h.text,
      src: { page: s.page, kind: "handwritten", quote: h.text },
      status: h.issue ? "pending" : "approved",
      issue: h.issue,
    })),
  };
  if (s.waiter) d.waiter = fact(s, "waiter", s.waiter, s.waiterSrc ?? s.waiter);
  if (s.waiter && s.wp) d.waiterPoints = fact(s, "waiter", s.wp, s.waiterSrc ?? s.waiter);
  if (filled(s.allergens) && s.al && s.al.length) d.allergens = fact(s, "allergens", s.al, s.allergens!);
  if (filled(s.gluten) && s.g) d.gluten = fact(s, "gluten", s.g, s.gluten!);
  if (filled(s.dairy) && s.d) d.dairy = fact(s, "dairy", s.d, s.dairy!);
  if (filled(s.msg) && s.m) d.msg = fact(s, "msg", s.m, s.msg!);
  if (filled(s.spice)) d.spice = fact(s, "spice", { level: s.sl, text: s.spice! }, s.spice!);
  if (filled(s.strong)) d.strong = fact(s, "strong", s.strong!, s.strong!);
  return d;
}

export const DISHES: Dish[] = SPECS.map(buildDish);
export const DISH_BY_ID = new Map(DISHES.map((d) => [d.id, d]));

/** עובדה שמותר להשתמש בה בשאלות, בתשובות ובהמלצות */
export const ok = <T>(f: Fact<T> | undefined): f is Fact<T> => !!f && f.status === "approved";

/** טקסט השדות המאושרים של מנה — לבדיקה ש"מסיח" באמת לא מופיע במנה */
export function allApprovedText(d: Dish): string {
  const parts: string[] = [d.name.value, d.description.value];
  if (d.waiter) parts.push(d.waiter.value); // גם משפט חסום — כדי לא להציג מסיח שאולי נכון
  d.changesYes.forEach((c) => parts.push(c.src.quote));
  d.notes.forEach((n) => parts.push(n.src.quote));
  d.variants.forEach((v) => parts.push(v.src.quote));
  d.hand.forEach((h) => parts.push(h.text));
  if (d.strong) parts.push(d.strong.value);
  return parts.join(" | ");
}

/** המילים שמעידות שבתיאור יש מוצר מן החי שאינו צמחוני */
export const ANIMAL_WORDS = [
  "עוף", "פרגית", "חזיר", "בקר", "דנוור", "שרימפ", "דג", "לברק", "דניס", "סרטנים", "קלמארי",
  "מולים", "תמנון", "פיש סוס", "פישסוס", "רוטב דגים", "אויסטר", "שרימפס פייסט", "פאלה", "ציר בקר", "ציר חזיר",
];

export function animalWordsIn(d: Dish): string[] {
  const t = d.description.value;
  return ANIMAL_WORDS.filter((w) => t.includes(w));
}
