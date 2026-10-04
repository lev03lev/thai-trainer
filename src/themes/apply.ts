// החלת ערכה על הדף — מיידית, בלי רענון.

import { PREFS_STORAGE_KEY } from "@/lib/preferences/repository";
import { DEFAULT_DARK, DEFAULT_LIGHT, THEME_BY_ID, THEMES, type ThemeChoice } from "./themes";

export function resolveTheme(choice: ThemeChoice, prefersDark: boolean) {
  if (choice !== "system" && THEME_BY_ID.has(choice)) return THEME_BY_ID.get(choice)!;
  return THEME_BY_ID.get(prefersDark ? DEFAULT_DARK : DEFAULT_LIGHT)!;
}

export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system" || !THEME_BY_ID.has(choice)) delete root.dataset.theme;
  else root.dataset.theme = choice;

  // צבע סרגל הדפדפן בטלפון
  const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const t = resolveTheme(choice, dark);
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = t.tokens.bg;
}

/**
 * סקריפט קטן שרץ ב-<head> לפני הציור הראשון: מחיל את הערכה השמורה,
 * כדי שלא יהיה הבהוב של העיצוב הרגיל לפני שהאפליקציה נטענת.
 */
export function themeBootScript(): string {
  const ids = JSON.stringify(THEMES.map((t) => t.id));
  const bgs = JSON.stringify(Object.fromEntries(THEMES.map((t) => [t.id, t.tokens.bg])));
  return `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_STORAGE_KEY)})||"null");var t=p&&p.theme;if(t&&${ids}.indexOf(t)>-1){document.documentElement.dataset.theme=t;var m=document.createElement("meta");m.name="theme-color";m.content=${bgs}[t];document.head.appendChild(m);}}catch(e){}})();`;
}
