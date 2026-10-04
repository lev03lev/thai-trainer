"use client";

import Link from "next/link";
import { DISHES, DISH_BY_ID } from "@/data/menu";
import { ISSUES } from "@/data/issues";
import { useProgress } from "@/lib/progress-store";
import { usePreferences } from "@/lib/preferences/store";
import { Avatar } from "@/components/Avatar";
import { mistakeKeys, safetyFocusKeys, streakDays, todayCount } from "@/lib/progress-core";
import { MODE_INFO, type Mode } from "@/lib/session";

const MODES: Mode[] = ["daily", "mixed", "image", "dish", "reverse", "scenario", "exam", "mistakes", "safety"];

function continueHref(last?: string): { href: string; label: string } {
  if (!last) return { href: "/practice?mode=daily", label: "להתחיל תרגול יומי" };
  if (last.startsWith("dish:")) {
    const id = last.slice(5);
    const d = DISH_BY_ID.get(id);
    return { href: `/practice?mode=dish&dish=${id}`, label: `להמשיך: ${d?.name.value ?? "מנה"}` };
  }
  const m = (last in MODE_INFO ? last : "daily") as Mode;
  return { href: `/practice?mode=${m}`, label: `להמשיך: ${MODE_INFO[m].title}` };
}

export default function Home() {
  const p = useProgress();
  const prefs = usePreferences();
  const answered = p.attempts.length;
  const recent = p.attempts.slice(-100);
  const acc = recent.length ? Math.round((recent.filter((a) => a.correct).length / recent.length) * 100) : null;
  const practicedDishes = new Set(p.attempts.flatMap((a) => a.dishIds)).size;
  const mistakes = mistakeKeys(p).length;
  const safety = safetyFocusKeys(p).length;
  const cont = continueHref(p.lastMode?.mode);
  const openIssues = ISSUES.length;

  return (
    <div className="stack">
      <section className="card hero">
        <div className="greet" style={{ flex: 1 }}>
          {(prefs.avatarId || prefs.displayName) && <Avatar id={prefs.avatarId} name={prefs.displayName} size={64} />}
          <div>
            <h1>{prefs.displayName ? `שלום, ${prefs.displayName}!` : "שלום!"} מתכוננת למבחן התפריט?</h1>
          <p className="muted">
            {answered
              ? `היום ענית על ${todayCount(p)} שאלות · רצף של ${streakDays(p)} ימים`
              : "כל השאלות מבוססות על חוברת הלימוד בלבד, עם הפניה לעמוד המקור."}
          </p>
          {!prefs.displayName && (
            <p className="small" style={{ margin: 0 }}>
              <Link href="/personalize">בחרי שם, אווטר וערכת עיצוב ←</Link>
            </p>
          )}
          </div>
        </div>
        <Link className="btn primary" href={cont.href}>
          {cont.label}
        </Link>
      </section>

      <section aria-labelledby="progress-h">
        <h2 id="progress-h">ההתקדמות שלך</h2>
        <div className="stats">
          <div className="stat">
            <span className="muted small">מנות שתרגלת</span>
            <b>
              {practicedDishes}/{DISHES.length}
            </b>
          </div>
          <div className="stat">
            <span className="muted small">דיוק (100 אחרונות)</span>
            <b>{acc === null ? "—" : `${acc}%`}</b>
          </div>
          <div className="stat">
            <span className="muted small">טעויות לחזרה</span>
            <b>{mistakes}</b>
          </div>
          <div className="stat">
            <span className="muted small">בטיחות לחיזוק</span>
            <b>{safety}</b>
          </div>
        </div>
        <div className="bar" style={{ marginTop: 12 }} role="progressbar" aria-valuemin={0} aria-valuemax={DISHES.length} aria-valuenow={practicedDishes} aria-label="מנות שתרגלת">
          <span style={{ width: `${(practicedDishes / DISHES.length) * 100}%` }} />
        </div>
        {safety > 0 && (
          <p className="notice safety" style={{ marginTop: 12 }}>
            ⚠ יש {safety} שאלות בנושא אלרגיות / גלוטן שטעית בהן.{" "}
            <Link href="/practice?mode=safety">לתרגול הממוקד</Link>
          </p>
        )}
      </section>

      <section aria-labelledby="modes-h">
        <h2 id="modes-h">מצבי לימוד</h2>
        <div className="grid">
          {MODES.map((m) => (
            <Link key={m} className="card mode" href={m === "dish" ? "/study" : `/practice?mode=${m}`}>
              <h3>{MODE_INFO[m].title}</h3>
              <p className="muted small" style={{ margin: 0 }}>
                {m === "dish" ? "בוחרים מנה מרשימת המנות ומתרגלים רק אותה" : MODE_INFO[m].desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <p className="notice">
          התוכן מבוסס על חוברת הלימוד. יש {openIssues} נקודות שממתינות לבירור (כתב יד לא ברור, סתירות והגדרות) — הן חסומות ולא מופיעות בתרגול.{" "}
          <Link href="/review">לרשימת הבירורים ולטבלת הסקירה</Link>
        </p>
      </section>
    </div>
  );
}
