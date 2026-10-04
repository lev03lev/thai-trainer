// שכבת האחסון של ההעדפות. היום: localStorage. בעתיד אפשר להוסיף מימוש שמדבר עם
// user settings בשרת (למשל GET/PUT /api/preferences) בלי לשנות את הממשק או את ה-store.

import type { UserPreferences } from "./model";

export interface PreferencesRepository {
  /** מחזיר את הנתונים הגולמיים (ה-store מנקה אותם עם sanitizePreferences) */
  load(): unknown;
  save(p: UserPreferences): void;
  /** האזנה לשינויים ממקור חיצוני (לשונית אחרת / שרת). מחזיר פונקציית ביטול. */
  subscribe?(onChange: (raw: unknown) => void): () => void;
}

export const PREFS_STORAGE_KEY = "thai-trainer:prefs:v1";

export const localStorageRepository: PreferencesRepository = {
  load() {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save(p) {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* גלישה פרטית / אחסון מלא — ההעדפות נשמרות בזיכרון עד הרענון */
    }
  },
  subscribe(onChange) {
    // שינוי בלשונית אחרת של אותו דפדפן
    const h = (e: StorageEvent) => {
      if (e.key !== PREFS_STORAGE_KEY) return;
      try {
        onChange(e.newValue ? JSON.parse(e.newValue) : null);
      } catch {
        onChange(null);
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  },
};
