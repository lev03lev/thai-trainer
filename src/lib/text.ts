// עזרי טקסט: נרמול, השוואה שמרנית ("האם הביטוי מוזכר במנה?").

export function norm(s: string): string {
  return s
    .replace(/[״"]/g, '"')
    .replace(/[׳’`]/g, "'")
    .replace(/[.,:;()!?—–\-/|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "עם", "של", "על", "או", "גם", "את", "אך", "אבל", "ללא", "בלי", "אפשר", "אי", "לא", "ניתן", "יש", "אין",
  "רוטב", "ברוטב", "מוגש", "מוגשת", "מוגשים", "בצד", "לצד", "מעל", "מלמעלה", "יח'", "יחידות", "מנה", "המנה",
  "טרי", "טריות", "קטן", "קטנות", "מטוגן", "מטוגנים", "מטוגנת", "מוקפץ", "מוקפצים", "סלט", "תאילנדי", "תאילנדית",
  "תאילנדים", "ירוק", "ירוקה", "לבן", "אדום", "שחור", "מאוד", "מעט", "קצת", "כמו", "לפי", "בקשה", "כל", "וגם",
]);

/** מילים קצרות שהן בכל זאת מרכיב ("דג") */
const SHORT_KEEP = new Set(["דג", "יין"]);

/** גזע גס של מילה עברית: הסרת ו' החיבור ותחיליות/סיומות נפוצות */
export function stem(w: string): string {
  let x = w.replace(/^[ו]/, "");
  if (x.length > 4) x = x.replace(/(ים|ות|ית)$/, "");
  if (x.length > 3) x = x.replace(/[הי]$/, "");
  return x;
}

const FINALS: Record<string, string> = { ן: "נ", ם: "מ", ץ: "צ", ף: "פ", ך: "כ" };
/** אותיות סופיות → רגילות, כדי ש"בוטן" ו"בוטנים" יזוהו כאותה מילה */
export const unfinal = (s: string) => s.replace(/[ןםץףך]/g, (c) => FINALS[c]);

export function keywords(phrase: string): string[] {
  return norm(phrase)
    .split(" ")
    .filter((w) => (w.length >= 3 || SHORT_KEEP.has(w)) && !STOP.has(w) && !/^\d/.test(w))
    .map((w) => unfinal(stem(w)))
    .filter((w) => w.length >= 2);
}

/**
 * שמרני בכוונה: מחזיר true אם *מילת מפתח כלשהי* של הביטוי מופיעה בטקסט.
 * כך מסיח שדומה במשהו למנה לא יוצג כ"תשובה שגויה".
 */
export function mentions(text: string, phrase: string): boolean {
  const t = unfinal(norm(text));
  const kws = keywords(phrase);
  if (kws.length === 0) return t.includes(unfinal(norm(phrase)));
  return kws.some((k) => t.includes(k));
}

/** תת-מחרוזת אחרי נרמול — משמש לבדיקת נאמנות למקור */
export function inQuote(value: string, quote: string): boolean {
  return norm(quote).includes(norm(value));
}
