// מודל הנתונים של התפריט.
// כל עובדה נשמרת יחד עם המקור שלה: עמוד, סוג (מודפס / כתב יד) ונוסח המקור.
// שדה שחסר במפרט = "לא ידוע" (ולא "אין").

export type SourceKind = "printed" | "handwritten";

export interface Source {
  page: number;
  kind: SourceKind;
  /** נוסח המקור כפי שמופיע בחוברת (סימני פיסוק מנורמלים) */
  quote: string;
}

export type Status = "approved" | "pending";

export interface Fact<T> {
  value: T;
  src: Source;
  status: Status;
  /** מזהה השאלה הפתוחה שחוסמת את העובדה (רק כש-status === "pending") */
  issue?: string;
}

export type Presence = "contains" | "free";

export type FieldKey =
  | "name"
  | "latin"
  | "image"
  | "description"
  | "ingredients"
  | "waiter"
  | "allergens"
  | "gluten"
  | "dairy"
  | "msg"
  | "spice"
  | "strong"
  | "changes"
  | "notes";

export interface Variant {
  /** שם הגרסה, למשל "גרסה טבעונית" */
  label: string;
  /** האם הגרסה מוגדרת במפורש כטבעונית */
  vegan?: boolean;
  gluten?: Presence;
  /** מה משתנה בגרסה, בנוסח החוברת */
  detail: string;
  src: Source;
  status: Status;
  issue?: string;
}

export interface HandNote {
  field: FieldKey | "service" | "extra-dish" | "strike";
  text: string;
  src: Source;
  status: Status;
  issue?: string;
}

export interface Dish {
  id: string;
  page: number;
  name: Fact<string>;
  latin?: Fact<string>;
  /** שם נוסף */
  aka?: Fact<string>;
  /** מנה שכולה מתוארת בכתב יד (לא עמוד מודפס משלה) */
  handwrittenDish?: boolean;
  image?: Fact<string>;
  description: Fact<string>;
  ingredients: Fact<string[]>;
  waiter?: Fact<string>;
  waiterPoints?: Fact<string[]>;
  allergens?: Fact<string[]>;
  gluten?: Fact<Presence>;
  dairy?: Fact<Presence>;
  msg?: Fact<{ has: boolean; removable?: boolean }>;
  spice?: Fact<{ level?: number; text: string }>;
  strong?: Fact<string>;
  changesYes: Fact<string>[];
  changesNo: Fact<string>[];
  notes: Fact<string>[];
  variants: Variant[];
  hand: HandNote[];
}

export interface Issue {
  id: string;
  dishId?: string;
  page?: number;
  title: string;
  /** מה כתוב / מה אפשר לקרוא */
  readings: string[];
  /** השאלה המדויקת שצריך להכריע */
  question: string;
  /** צילומי המקור (נתיבים תחת public/review) */
  crops: string[];
  /** מה חסום עד להכרעה */
  blocks: string;
  kind: "handwriting" | "conflict" | "definition" | "missing" | "service";
}
