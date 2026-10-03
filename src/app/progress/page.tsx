"use client";

import Link from "next/link";
import { DISHES } from "@/data/menu";
import { AREA_LABEL, type Area } from "@/lib/quiz";
import { useProgress } from "@/lib/progress-store";
import { mistakeKeys, rate, safetyFocusKeys, statsBy, streakDays } from "@/lib/progress-core";
import { RichText } from "@/components/RichText";

const pct = (x: number) => `${Math.round(x * 100)}%`;

export default function ProgressPage() {
  const p = useProgress();
  const byArea = statsBy(p, (a) => [a.area]);
  const byDish = statsBy(p, (a) => a.dishIds, 2000);
  const dishRows = DISHES.map((d) => ({ d, s: byDish.get(d.id) })).sort((a, b) => {
    const ra = a.s ? rate(a.s) : -1;
    const rb = b.s ? rate(b.s) : -1;
    return ra - rb;
  });

  if (!p.attempts.length) {
    return (
      <div className="card stack">
        <h1>התקדמות</h1>
        <p>עוד לא ענית על שאלות. אחרי כמה סבבים יופיעו כאן הדיוק לפי תחום ולפי מנה, והמנות שכדאי לחזק.</p>
        <Link className="btn primary" href="/practice?mode=daily">
          להתחיל תרגול יומי
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>התקדמות</h1>
      <div className="stats">
        <div className="stat">
          <span className="muted small">תשובות</span>
          <b>{p.attempts.length}</b>
        </div>
        <div className="stat">
          <span className="muted small">רצף ימים</span>
          <b>{streakDays(p)}</b>
        </div>
        <div className="stat">
          <span className="muted small">טעויות לחזרה</span>
          <b>{mistakeKeys(p).length}</b>
        </div>
        <div className="stat">
          <span className="muted small">בטיחות לחיזוק</span>
          <b>{safetyFocusKeys(p).length}</b>
        </div>
      </div>

      <h2>דיוק לפי תחום (400 תשובות אחרונות)</h2>
      <div className="card stack">
        {(Object.keys(AREA_LABEL) as Area[])
          .filter((a) => byArea.has(a))
          .map((a) => {
            const s = byArea.get(a)!;
            return (
              <div key={a}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>{AREA_LABEL[a]}</span>
                  <span className="muted small">
                    {pct(rate(s))} · {s.correct}/{s.total}
                  </span>
                </div>
                <div className="bar" role="progressbar" aria-label={AREA_LABEL[a]} aria-valuenow={Math.round(rate(s) * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: pct(rate(s)) }} />
                </div>
              </div>
            );
          })}
      </div>

      <h2>לפי מנה (החלשות קודם)</h2>
      <div className="table-wrap narrow">
        <table>
          <thead>
            <tr>
              <th>מנה</th>
              <th>דיוק</th>
              <th>תשובות</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dishRows.map(({ d, s }) => (
              <tr key={d.id}>
                <td>
                  <RichText text={d.name.value} />
                </td>
                <td className={s ? "" : "u"}>{s ? pct(rate(s)) : "עוד לא תורגלה"}</td>
                <td>{s?.total ?? 0}</td>
                <td>
                  <Link href={`/practice?mode=dish&dish=${d.id}`}>לתרגל</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {p.exams.length > 0 && (
        <>
          <h2>מבחנים מדמים</h2>
          <div className="table-wrap narrow">
            <table>
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>ציון</th>
                  <th>זמן</th>
                </tr>
              </thead>
              <tbody>
                {[...p.exams].reverse().map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.ts).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td>
                      {Math.round((e.score / e.total) * 100)} ({e.score}/{e.total})
                    </td>
                    <td>
                      {Math.floor(e.seconds / 60)}:{String(e.seconds % 60).padStart(2, "0")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
