// מודל העדפות המשתמש. קוד טהור — בלי DOM ובלי אחסון — כדי שאותו מבנה ישמש
// גם בעתיד כ-user settings בשרת (אותו JSON, אותו sanitize).

import { isThemeChoice, type ThemeChoice } from "@/themes/themes";

export interface UserPreferences {
  v: 1;
  theme: ThemeChoice;
  displayName: string;
  /** מזהה מתוך בנק האווטרים; null = עדיין לא נבחר (מוצגת האות הראשונה של השם) */
  avatarId: string | null;
  updatedAt: number;
}

export const NAME_MAX = 24;

export const defaultPreferences = (): UserPreferences => ({
  v: 1,
  theme: "system",
  displayName: "",
  avatarId: null,
  updatedAt: 0,
});

/** ניקוי שם תצוגה: רווחים כפולים, תווי בקרה ואורך */
export function cleanName(name: string): string {
  return name
    .replace(/[\u0000-\u001f\u007f‎‏‪-‮]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX);
}

/**
 * הופך כל קלט (מ-localStorage, מגרסה ישנה, או בעתיד מהשרת) להעדפות תקינות.
 * ערך לא מוכר מוחלף בברירת המחדל במקום לשבור את הממשק.
 */
export function sanitizePreferences(input: unknown, knownAvatar: (id: string) => boolean): UserPreferences {
  const d = defaultPreferences();
  if (!input || typeof input !== "object") return d;
  const p = input as Partial<UserPreferences>;
  return {
    v: 1,
    theme: isThemeChoice(p.theme) ? p.theme : d.theme,
    displayName: typeof p.displayName === "string" ? cleanName(p.displayName) : d.displayName,
    avatarId: typeof p.avatarId === "string" && knownAvatar(p.avatarId) ? p.avatarId : null,
    updatedAt: typeof p.updatedAt === "number" && Number.isFinite(p.updatedAt) ? p.updatedAt : 0,
  };
}

/** האות שמוצגת כשאין אווטר */
export function initialOf(name: string): string {
  const c = cleanName(name);
  return c ? [...c][0].toUpperCase() : "";
}
