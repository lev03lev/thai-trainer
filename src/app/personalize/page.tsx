"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/personalize/AvatarPicker";
import { ThemePicker } from "@/components/personalize/ThemePicker";
import { NAME_MAX, cleanName } from "@/lib/preferences/model";
import { getPreferences, resetPreferences, saveProfile, setTheme, usePreferences } from "@/lib/preferences/store";
import { THEME_BY_ID } from "@/themes/themes";

interface Draft {
  name: string;
  avatarId: string | null;
}

export default function PersonalizePage() {
  const prefs = usePreferences();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // הטיוטה מאותחלת מהנתונים השמורים בדפדפן (לא מערך ברירת המחדל של השרת)
  useEffect(() => {
    const p = getPreferences();
    setDraft({ name: p.displayName, avatarId: p.avatarId });
  }, []);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const dirty = !!draft && (cleanName(draft.name) !== prefs.displayName || draft.avatarId !== prefs.avatarId);
  const previewName = draft ? cleanName(draft.name) : prefs.displayName;
  const themeName = prefs.theme === "system" ? "לפי המכשיר" : (THEME_BY_ID.get(prefs.theme)?.name ?? "");

  const save = () => {
    if (!draft) return;
    saveProfile({ displayName: draft.name, avatarId: draft.avatarId });
    setDraft({ name: cleanName(draft.name), avatarId: draft.avatarId });
    setSavedAt(Date.now());
  };

  return (
    <div className="stack pz">
      <header className="pz-head">
        <h1>התאמה אישית</h1>
        <p className="muted" style={{ margin: 0 }}>
          שם, אווטר וערכת עיצוב — כדי שהתרגול ירגיש שלך. ההגדרות נשמרות במכשיר הזה.
        </p>
      </header>

      <section className="card pz-section" aria-labelledby="profile-h">
        <div className="pz-section-head">
          <h2 id="profile-h">הפרופיל שלך</h2>
          <p className="muted small">השם והאווטר יופיעו בסרגל העליון ובמסך הבית.</p>
        </div>

        {!draft ? (
          <p className="muted">טוען…</p>
        ) : (
          <div className="pz-profile">
            <div className="stack pz-form">
              <div className="field">
                <label htmlFor="display-name">שם תצוגה</label>
                <div className="input-wrap">
                  <input
                    id="display-name"
                    type="text"
                    className="text-input"
                    value={draft.name}
                    maxLength={NAME_MAX + 8}
                    placeholder="למשל: נוגה"
                    autoComplete="nickname"
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && dirty) save();
                    }}
                    aria-describedby="name-count"
                  />
                  <span id="name-count" className="muted small counter" aria-live="polite">
                    {cleanName(draft.name).length}/{NAME_MAX}
                  </span>
                </div>
              </div>

              <div className="field">
                <span className="label" id="avatar-label">
                  אווטר
                </span>
                <AvatarPicker value={draft.avatarId} name={draft.name} onChange={(id) => setDraft({ ...draft, avatarId: id })} />
              </div>
            </div>

            <aside className="pz-preview" aria-label="תצוגה מקדימה של הפרופיל">
              <div className="pz-preview-hero">
                <Avatar id={draft.avatarId} name={previewName} size={96} className="pz-big-avatar" />
                <div className="pz-preview-name">{previewName || "בלי שם"}</div>
                <div className="muted small">{dirty ? "תצוגה מקדימה — עוד לא נשמר" : "כך זה נראה עכשיו"}</div>
              </div>
              <div className="pz-mock">
                <span className="muted small">בסרגל העליון</span>
                <div className="pz-mock-bar">
                  <span className="pz-mock-brand">המחתרת התאילנדית</span>
                  <span className="user-chip is-static">
                    <Avatar id={draft.avatarId} name={previewName} size={28} />
                    <span className="user-chip-name">{previewName || "התאמה אישית"}</span>
                  </span>
                </div>
              </div>
              <div className="pz-mock">
                <span className="muted small">במסך הבית</span>
                <div className="pz-mock-greeting">{previewName ? `שלום, ${previewName}!` : "שלום!"} מתכוננת למבחן התפריט?</div>
              </div>
            </aside>
          </div>
        )}

        <div className="save-bar">
          <button type="button" className="btn primary" disabled={!dirty} onClick={save}>
            שמירת הפרופיל
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={!dirty}
            onClick={() => setDraft({ name: prefs.displayName, avatarId: prefs.avatarId })}
          >
            ביטול שינויים
          </button>
          <span className={`toast ${savedAt ? "show" : ""}`} role="status" aria-live="polite">
            {savedAt ? "✓ הפרופיל נשמר" : ""}
          </span>
        </div>
      </section>

      <section className="card pz-section" aria-labelledby="theme-h">
        <div className="pz-section-head">
          <h2 id="theme-h">ערכת עיצוב</h2>
          <p className="muted small">
            הערכה מתחלפת מיד ונשמרת אוטומטית. כרגע: <b>{themeName}</b>
          </p>
        </div>
        <ThemePicker value={prefs.theme} onChange={setTheme} />
      </section>

      <section className="pz-footer">
        <p className="muted small" style={{ margin: 0 }}>
          רוצה להמשיך מאותה נקודה גם בטלפון? <Link href="/settings">סנכרון התקדמות בין מכשירים</Link>
        </p>
        <button
          type="button"
          className="btn ghost small-btn"
          onClick={() => {
            if (confirm("לאפס את השם, האווטר וערכת העיצוב?")) {
              resetPreferences();
              setDraft({ name: "", avatarId: null });
            }
          }}
        >
          איפוס ההתאמה האישית
        </button>
      </section>
    </div>
  );
}
