// מבנה נתוני ההתקדמות ומיזוג בין מכשירים. קוד טהור — משמש גם בשרת וגם בדפדפן.

import type { Area } from "./quiz";

export interface Attempt {
  id: string;
  key: string;
  area: Area;
  dishIds: string[];
  correct: boolean;
  safety: boolean;
  ts: number;
  mode: string;
}

export interface ExamResult {
  id: string;
  ts: number;
  score: number;
  total: number;
  seconds: number;
}

export interface ProgressData {
  v: 1;
  attempts: Attempt[];
  exams: ExamResult[];
  lastMode?: { mode: string; ts: number };
}

export const MAX_ATTEMPTS = 6000;

export const emptyProgress = (): ProgressData => ({ v: 1, attempts: [], exams: [] });

function unionById<T extends { id: string; ts: number }>(a: T[], b: T[], max: number): T[] {
  const m = new Map<string, T>();
  for (const x of [...a, ...b]) m.set(x.id, x);
  return [...m.values()].sort((x, y) => x.ts - y.ts).slice(-max);
}

/** מיזוג ללא התנגשויות: איחוד רשומות לפי מזהה. אותה רשומה בשני מכשירים לא נספרת פעמיים. */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const lm = [a.lastMode, b.lastMode].filter(Boolean).sort((x, y) => y!.ts - x!.ts)[0];
  return {
    v: 1,
    attempts: unionById(a.attempts ?? [], b.attempts ?? [], MAX_ATTEMPTS),
    exams: unionById(a.exams ?? [], b.exams ?? [], 500),
    ...(lm ? { lastMode: lm } : {}),
  };
}

export function isProgressData(x: unknown): x is ProgressData {
  if (!x || typeof x !== "object") return false;
  const p = x as ProgressData;
  return p.v === 1 && Array.isArray(p.attempts) && Array.isArray(p.exams);
}

// ---------- נגזרות ----------

/** המפתחות שהתשובה האחרונה עליהם הייתה שגויה (החדשים קודם) */
export function mistakeKeys(p: ProgressData): string[] {
  const last = new Map<string, Attempt>();
  for (const a of p.attempts) last.set(a.key, a);
  return [...last.values()].filter((a) => !a.correct).sort((x, y) => y.ts - x.ts).map((a) => a.key);
}

/**
 * תרגול ממוקד לטעויות בטיחות: שאלת בטיחות שטעו בה נשארת בתור
 * עד שעונים עליה נכון פעמיים ברציפות.
 */
export function safetyFocusKeys(p: ProgressData): string[] {
  const streak = new Map<string, number>();
  const everWrong = new Set<string>();
  for (const a of p.attempts) {
    if (!a.safety) continue;
    if (!a.correct) {
      everWrong.add(a.key);
      streak.set(a.key, 0);
    } else streak.set(a.key, (streak.get(a.key) ?? 0) + 1);
  }
  return [...everWrong].filter((k) => (streak.get(k) ?? 0) < 2);
}

export function seenCount(p: ProgressData): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of p.attempts) m.set(a.key, (m.get(a.key) ?? 0) + 1);
  return m;
}

export interface Stat {
  total: number;
  correct: number;
}
const rate = (s: Stat) => (s.total ? s.correct / s.total : 0);
export { rate };

export function statsBy<K extends string>(p: ProgressData, keyOf: (a: Attempt) => K[], lastN = 400): Map<K, Stat> {
  const m = new Map<K, Stat>();
  for (const a of p.attempts.slice(-lastN)) {
    for (const k of keyOf(a)) {
      const s = m.get(k) ?? { total: 0, correct: 0 };
      s.total++;
      if (a.correct) s.correct++;
      m.set(k, s);
    }
  }
  return m;
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function streakDays(p: ProgressData, now = Date.now()): number {
  const days = new Set(p.attempts.map((a) => dayKey(a.ts)));
  let n = 0;
  const d = new Date(now);
  // אם היום עוד לא תורגל — הרצף נמדד מאתמול
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d.getTime()))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function todayCount(p: ProgressData, now = Date.now()): number {
  const k = dayKey(now);
  return p.attempts.filter((a) => dayKey(a.ts) === k).length;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function isValidCode(code: string): boolean {
  return /^[A-Z0-9]{8,32}$/.test(code);
}
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
export function newCode(rand: (n: number) => number): string {
  let s = "";
  for (let i = 0; i < 10; i++) s += CODE_CHARS[rand(CODE_CHARS.length)];
  return s;
}
