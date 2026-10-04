"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { AvatarBuilder } from "@/components/personalize/AvatarBuilder";
import { AvatarGallery } from "@/components/personalize/AvatarGallery";
import { ThemePicker } from "@/components/personalize/ThemePicker";
import { CUSTOM_AVATAR_ID, type AvatarConfig } from "@/avatars/catalog";
import { DEFAULT_CONFIG, sanitizeConfig } from "@/avatars/dicebear";
import { NAME_MAX, cleanName } from "@/lib/preferences/model";
import { getPreferences, resetPreferences, saveProfile, setTheme, usePreferences } from "@/lib/preferences/store";
import { THEME_BY_ID, type ThemeChoice } from "@/themes/themes";

interface Draft {
  name: string;
  avatarId: string | null;
  custom: AvatarConfig;
}

const themeLabel = (t: ThemeChoice) => (t === "system" ? "לפי המכשיר" : (THEME_BY_ID.get(t)?.name ?? ""));

export default function PersonalizePage() {
  const prefs = usePreferences();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [mode, setMode] = useState<"gallery" | "builder">("gallery");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [preview, setPreview] = useState<ThemeChoice | null>(null);

  // הטיוטה מאותחלת מהנתונים השמורים בדפדפן (לא מערך ברירת המחדל של השרת)
  useEffect(() => {
    const p = getPreferences();
    setDraft({ name: p.displayName, avatarId: p.avatarId, custom: p.avatarCustom ? sanitizeConfig(p.avatarCustom) : DEFAULT_CONFIG });
    if (p.avatarId === CUSTOM_AVATAR_ID) setMode("builder");
  }, []);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const savedCustom = prefs.avatarCustom ? JSON.stringify(sanitizeConfig(prefs.avatarCustom)) : JSON.stringify(DEFAULT_CONFIG);
  const dirty =
    !!draft &&
    (cleanName(draft.name) !== prefs.displayName || draft.avatarId !== prefs.avatarId || JSON.stringify(draft.custom) !== savedCustom);
  const name = draft ? cleanName(draft.name) : prefs.displayName;
  const avatarId = draft?.avatarId ?? prefs.avatarId;
  const custom = draft?.custom ?? null;
  const avatarKey = avatarId === CUSTOM_AVATAR_ID ? JSON.stringify(custom) : avatarId;
  const previewing = preview !== null && preview !== prefs.theme;
  const shownTheme = previewing ? preview : prefs.theme;
  const shownMeta = shownTheme === "system" ? undefined : THEME_BY_ID.get(shownTheme);

  const save = () => {
    if (!draft) return;
    saveProfile({ displayName: draft.name, avatarId: draft.avatarId, avatarCustom: draft.custom });
    setDraft({ ...draft, name: cleanName(draft.name) });
    setSavedAt(Date.now());
  };
  const revert = () => {
    const p = getPreferences();
    setDraft({ name: p.displayName, avatarId: p.avatarId, custom: p.avatarCustom ? sanitizeConfig(p.avatarCustom) : DEFAULT_CONFIG });
  };

  return (
    <div className="pz">
      <header className="pz-head">
        <h1>התאמה אישית</h1>
        <p className="muted" style={{ margin: 0 }}>
          עצבי לעצמך דמות, בחרי שם ואווירה — וכל התרגול ירגיש שלך.
        </p>
      </header>

      <div className="pz-layout">
        {/* ---------- כרטיס פרופיל חי ---------- */}
        <aside className="pz-stage" aria-label="תצוגה מקדימה חיה">
          <div className="pz-hero" data-theme={previewing && preview !== "system" ? preview : undefined}>
            <div className="pz-hero-top">
              <span className="badge">{previewing ? `תצוגה מקדימה: ${themeLabel(preview!)}` : `ערכה: ${themeLabel(prefs.theme)}`}</span>
              {shownMeta && <span className="badge">{shownMeta.vibe}</span>}
            </div>
            <div className="pz-hero-avatar" key={avatarKey ?? "none"}>
              <Avatar id={avatarId} custom={custom} name={name} size={132} className="pz-big-avatar" />
            </div>
            <div className="pz-hero-name">{name || "בלי שם עדיין"}</div>
            <div className="pz-hero-sub">{dirty ? "✏️ שינויים שעוד לא נשמרו" : "כך רואים אותך במערכת"}</div>
            <div className="pz-hero-ui" aria-hidden="true">
              <span className="pz-fake-btn">להתחיל תרגול</span>
              <span className="badge ok">✓ נכון</span>
              <span className="badge bad">✗ לא נכון</span>
            </div>
            <div className="bar pz-hero-bar" aria-hidden="true">
              <span style={{ width: "62%" }} />
            </div>
          </div>

          <div className="pz-mock">
            <span className="muted small">בסרגל העליון</span>
            <div className="pz-mock-bar">
              <span className="pz-mock-brand">המחתרת התאילנדית</span>
              <span className="user-chip is-static">
                <Avatar id={avatarId} custom={custom} name={name} size={28} />
                <span className="user-chip-name">{name || "התאמה אישית"}</span>
              </span>
            </div>
          </div>

          <div className="save-bar">
            <button type="button" className="btn primary" disabled={!dirty} onClick={save}>
              שמירת הפרופיל
            </button>
            <button type="button" className="btn ghost" disabled={!dirty} onClick={revert}>
              ביטול שינויים
            </button>
            <span className={`toast ${savedAt ? "show" : ""}`} role="status" aria-live="polite">
              {savedAt ? "✓ הפרופיל נשמר" : ""}
            </span>
          </div>
        </aside>

        {/* ---------- הגדרות ---------- */}
        <div className="pz-controls stack">
          <section className="card pz-section" aria-labelledby="profile-h">
            <div className="pz-section-head">
              <h2 id="profile-h">שם ואווטר</h2>
              <p className="muted small">השם והאווטר יופיעו בסרגל העליון ובמסך הבית.</p>
            </div>

            {!draft ? (
              <p className="muted">טוען…</p>
            ) : (
              <div className="stack">
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
                  <span className="label">אווטר</span>
                  <div className="segmented big" role="tablist" aria-label="איך לבחור אווטר">
                    <button type="button" role="tab" aria-selected={mode === "gallery"} onClick={() => setMode("gallery")}>
                      🖼️ גלריה
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === "builder"}
                      onClick={() => {
                        setMode("builder");
                        setDraft({ ...draft, avatarId: CUSTOM_AVATAR_ID });
                      }}
                    >
                      ✨ עיצוב אישי
                    </button>
                  </div>

                  {mode === "gallery" ? (
                    <>
                      <AvatarGallery
                        value={draft.avatarId}
                        onChange={(id) => setDraft({ ...draft, avatarId: id })}
                        onCustomize={(config) => {
                          setDraft({ ...draft, avatarId: CUSTOM_AVATAR_ID, custom: config });
                          setMode("builder");
                        }}
                      />
                      {draft.avatarId && (
                        <button type="button" className="btn ghost small-btn" style={{ alignSelf: "start" }} onClick={() => setDraft({ ...draft, avatarId: null })}>
                          בלי אווטר (האות הראשונה של השם)
                        </button>
                      )}
                    </>
                  ) : (
                    <AvatarBuilder config={draft.custom} onChange={(c) => setDraft({ ...draft, avatarId: CUSTOM_AVATAR_ID, custom: c })} />
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="card pz-section" aria-labelledby="theme-h">
            <div className="pz-section-head">
              <h2 id="theme-h">ערכת עיצוב</h2>
              <p className="muted small">
                רחפי מעל ערכה כדי לראות אותה בכרטיס, ולחצי כדי להחליף את כל המערכת. נשמר אוטומטית.
              </p>
            </div>
            <ThemePicker
              value={prefs.theme}
              onPreview={setPreview}
              onChange={(t, origin) => {
                setPreview(null);
                setTheme(t, origin);
              }}
            />
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
                  setDraft({ name: "", avatarId: null, custom: DEFAULT_CONFIG });
                  setMode("gallery");
                }
              }}
            >
              איפוס ההתאמה האישית
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
