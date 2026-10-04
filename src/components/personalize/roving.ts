import type { KeyboardEvent } from "react";

/**
 * ניווט חצים בתוך רשת של כפתורים (תבנית radiogroup): חצים מזיזים ובוחרים,
 * Home/End לקצוות. מותאם ל-RTL: חץ שמאלה = הפריט הבא.
 */
export function onGridKeyDown(e: KeyboardEvent<HTMLElement>, select: (index: number) => void) {
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-roving]"));
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  const top = items[0].offsetTop;
  const cols = Math.max(1, items.filter((x) => x.offsetTop === top).length);
  const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
  const map: Record<string, number> = {
    ArrowLeft: rtl ? 1 : -1,
    ArrowRight: rtl ? -1 : 1,
    ArrowDown: cols,
    ArrowUp: -cols,
  };
  let next = i;
  if (e.key in map) next = Math.min(items.length - 1, Math.max(0, i + map[e.key]));
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = items.length - 1;
  else return;
  e.preventDefault();
  items[next].focus();
  select(next);
}
