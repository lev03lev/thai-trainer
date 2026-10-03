"use client";

import { useState } from "react";
import { connectSyncCode, createSyncCode, disconnectSync, resetLocalProgress, syncNow, useProgress, useSync } from "@/lib/progress-store";

const STATUS_TEXT = {
  off: "הסנכרון כבוי — ההתקדמות נשמרת רק במכשיר הזה.",
  syncing: "מסנכרנת…",
  ok: "מסונכרן ✓",
  error: "הסנכרון נכשל (אין חיבור?). ההתקדמות שמורה במכשיר וננסה שוב בשמירה הבאה.",
  "not-configured": "שירות הסנכרון עוד לא הוגדר בשרת. ההתקדמות נשמרת רק במכשיר הזה.",
} as const;

export default function SettingsPage() {
  const { status, code, lastSyncAt } = useSync();
  const p = useProgress();
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="stack">
      <h1>סנכרון בין טלפון למחשב</h1>
      <p>
        כדי להמשיך מאותה נקודה בכל מכשיר, יוצרים <b>קוד סנכרון</b> במכשיר אחד ומקלידים אותו במכשיר השני. אין צורך בחשבון או בסיסמה — שמרי את הקוד לעצמך.
      </p>

      <div className="card stack">
        <p role="status" aria-live="polite" className={status === "ok" ? "" : "muted"}>
          {STATUS_TEXT[status]}
          {status === "ok" && lastSyncAt ? ` (${new Date(lastSyncAt).toLocaleTimeString("he-IL")})` : ""}
        </p>
        {code ? (
          <>
            <p>
              הקוד שלך:{" "}
              <b style={{ fontSize: 22, letterSpacing: "0.1em" }}>
                <bdi dir="ltr">{code}</bdi>
              </b>
            </p>
            <p className="muted small">במכשיר השני: פותחים את העמוד הזה, מקלידים את הקוד ולוחצים ״חיבור״.</p>
            <div className="row">
              <button type="button" className="btn" onClick={() => void syncNow()}>
                לסנכרן עכשיו
              </button>
              <button type="button" className="btn" onClick={disconnectSync}>
                ניתוק המכשיר הזה
              </button>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="btn primary" onClick={() => createSyncCode()}>
              יצירת קוד סנכרון חדש
            </button>
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                setErr(connectSyncCode(input) ? "" : "הקוד צריך להכיל 8 עד 32 אותיות לועזיות או ספרות.");
              }}
            >
              <label htmlFor="code">יש לך כבר קוד ממכשיר אחר?</label>
              <div className="row">
                <input id="code" type="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={input} onChange={(e) => setInput(e.target.value)} />
                <button type="submit" className="btn">
                  חיבור
                </button>
              </div>
              {err && <p className="notice">{err}</p>}
            </form>
          </>
        )}
      </div>

      <h2>נתונים במכשיר הזה</h2>
      <div className="card stack">
        <p>
          נשמרו {p.attempts.length} תשובות ו-{p.exams.length} מבחנים.
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (confirm("למחוק את ההתקדמות מהמכשיר הזה? (אם יש סנכרון, הנתונים בשרת יישארו ויחזרו בסנכרון הבא)")) resetLocalProgress();
          }}
        >
          איפוס ההתקדמות במכשיר
        </button>
      </div>
    </div>
  );
}
