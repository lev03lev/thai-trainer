"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DISH_BY_ID } from "@/data/menu";
import { AREA_LABEL, isCorrect, makeQuestion, type Question } from "@/lib/quiz";
import { buildSession, dishOfKey, MODE_INFO, type Mode } from "@/lib/session";
import { getProgress, recordAttempt, recordExam, setLastMode } from "@/lib/progress-store";
import { RichText } from "./RichText";
import type { Source } from "@/data/types";

const EXAM_SECONDS = 15 * 60;

function toQuestion(key: string): Question | null {
  const withImg = key.endsWith("#img");
  const base = withImg ? key.slice(0, -4) : key;
  const q = makeQuestion(base);
  if (!q) return null;
  if (withImg) {
    const d = DISH_BY_ID.get(dishOfKey(base) ?? "");
    if (d?.image?.status === "approved") return { ...q, image: d.image.value };
  }
  return q;
}

export function SourceBadges({ sources }: { sources: Source[] }) {
  const uniq = [...new Map(sources.map((s) => [`${s.page}-${s.kind}`, s])).values()].sort((a, b) => a.page - b.page);
  return (
    <div className="sources" aria-label="מקור בחוברת">
      {uniq.map((s) => (
        <span key={`${s.page}-${s.kind}`} className={`badge ${s.kind === "handwritten" ? "hand" : ""}`}>
          עמ׳ {s.page} · {s.kind === "handwritten" ? "כתב יד" : "מודפס"}
        </span>
      ))}
    </div>
  );
}

interface Answer {
  key: string;
  q: Question;
  correct: boolean;
  chosen: string[];
  parts?: string[];
}

export function Practice({ mode, dishId }: { mode: Mode; dishId?: string }) {
  const [keys, setKeys] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [q, setQ] = useState<Question | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [parts, setParts] = useState<string[]>([]);
  const [answered, setAnswered] = useState<Answer | null>(null);
  const [log, setLog] = useState<Answer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [done, setDone] = useState(false);
  const started = useRef<number>(0);
  const exam = mode === "exam";
  const headingRef = useRef<HTMLHeadingElement>(null);

  // בניית הסבב פעם אחת, אחרי שההתקדמות נטענה מהדפדפן
  useEffect(() => {
    if (keys) return;
    const k = buildSession(mode, getProgress(), Math.random, dishId);
    setKeys(k);
    started.current = Date.now();
    setLastMode(mode === "dish" && dishId ? `dish:${dishId}` : mode);
  }, [keys, mode, dishId]);

  useEffect(() => {
    if (!keys || idx >= keys.length) return;
    let next = toQuestion(keys[idx]);
    let j = idx;
    // מפתח שכבר לא תקף (למשל אחרי עדכון תוכן) — מדלגים
    while (!next && j + 1 < keys.length) next = toQuestion(keys[++j]);
    if (j !== idx) setIdx(j);
    setQ(next);
    setChosen([]);
    setParts(next?.parts ? next.parts.map(() => "") : []);
    setAnswered(null);
    headingRef.current?.focus();
  }, [keys, idx]);

  const finish = useCallback(
    (finalLog: Answer[]) => {
      setDone(true);
      if (exam) {
        recordExam({
          score: finalLog.filter((a) => a.correct).length,
          total: keys?.length ?? finalLog.length,
          seconds: Math.round((Date.now() - started.current) / 1000),
        });
      }
    },
    [exam, keys],
  );

  // טיימר מבחן
  useEffect(() => {
    if (!exam || done || !keys) return;
    const t = setInterval(() => {
      const left = EXAM_SECONDS - Math.floor((Date.now() - started.current) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(t);
        finish(log);
      }
    }, 500);
    return () => clearInterval(t);
  }, [exam, done, keys, log, finish]);

  const ready = q && (q.parts ? parts.every(Boolean) : chosen.length > 0 || (q.multi && q.correct.length === 0));

  const submit = useCallback(() => {
    if (!q || answered || !ready) return;
    const correct = isCorrect(q, chosen, parts);
    const a: Answer = { key: keys![idx], q, correct, chosen, parts };
    recordAttempt({
      key: q.key,
      area: q.area,
      dishIds: q.dishIds,
      correct,
      safety: q.safety,
      mode,
    });
    const newLog = [...log, a];
    setLog(newLog);
    if (exam) {
      if (idx + 1 >= keys!.length) finish(newLog);
      else setIdx(idx + 1);
    } else setAnswered(a);
  }, [q, answered, ready, chosen, parts, keys, idx, mode, log, exam, finish]);

  const next = useCallback(() => {
    if (!keys) return;
    if (idx + 1 >= keys.length) finish(log);
    else setIdx(idx + 1);
  }, [keys, idx, log, finish]);

  const toggle = useCallback(
    (id: string) => {
      if (answered || !q) return;
      if (q.multi) setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
      else setChosen([id]);
    },
    [answered, q],
  );

  // מקלדת: 1–9 לבחירה, Enter לבדיקה / לשאלה הבאה
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !q) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
      const n = Number(e.key);
      if (!q.parts && n >= 1 && n <= q.options.length) {
        e.preventDefault();
        toggle(q.options[n - 1].id);
      } else if (e.key === "Enter" && (tag !== "BUTTON" || answered)) {
        e.preventDefault();
        if (answered) next();
        else submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, q, answered, toggle, submit, next]);

  const score = useMemo(() => log.filter((a) => a.correct).length, [log]);

  if (!keys) return <p className="muted">טוען…</p>;

  if (keys.length === 0) {
    return (
      <div className="card stack">
        <h1>{MODE_INFO[mode].title}</h1>
        <p>{mode === "mistakes" ? "אין כרגע טעויות לחזור עליהן. כל הכבוד!" : "אין כרגע שאלות במצב הזה."}</p>
        <Link className="btn primary" href="/">
          חזרה למסך הבית
        </Link>
      </div>
    );
  }

  if (done)
    return (
      <Summary
        mode={mode}
        log={log}
        total={keys.length}
        score={score}
        onRestart={() => {
          setLog([]);
          setIdx(0);
          setDone(false);
          setSecondsLeft(EXAM_SECONDS);
          setKeys(null);
        }}
      />
    );
  if (!q) return <p className="muted">טוען שאלה…</p>;

  const dishName = mode === "dish" && q.dishIds[0] ? DISH_BY_ID.get(q.dishIds[0])?.name.value : null;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <section aria-labelledby="q-title">
      <div className="q-head">
        <span className="muted small">
          {MODE_INFO[mode].title}
          {dishName ? ` · ${dishName}` : ""} · שאלה {idx + 1} מתוך {keys.length}
        </span>
        <span className="row small">
          <span className="badge">{AREA_LABEL[q.area]}</span>
          {exam ? (
            <span className="timer" aria-live="off" aria-label={`זמן שנותר ${mm}:${ss}`}>
              ⏱ {mm}:{ss}
            </span>
          ) : (
            <span className="muted">
              נכונות: {score}/{log.length}
            </span>
          )}
        </span>
      </div>
      <div className="bar" aria-hidden="true" style={{ marginBottom: 14 }}>
        <span style={{ width: `${((idx + (answered ? 1 : 0)) / keys.length) * 100}%` }} />
      </div>

      <div className="card">
        <h1 id="q-title" className="q-prompt" tabIndex={-1} ref={headingRef}>
          <RichText text={q.prompt} />
        </h1>
        {q.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="q-img" src={q.image} alt="איור של מנה מתוך חוברת הלימוד" />
        )}
        {q.multi && !answered && <p className="muted small">אפשר לבחור יותר מתשובה אחת (או אף אחת).</p>}

        {q.parts ? (
          <div>
            {q.parts.map((p, i) => {
              const res = answered ? (answered.parts?.[i] === p.correct ? "ok" : "bad") : null;
              return (
                <div className="part" key={i}>
                  <label htmlFor={`part-${i}`}>
                    <RichText text={p.label} />{" "}
                    {res && <span className={`badge ${res}`}>{res === "ok" ? "נכון" : `נכון: ${p.options.find((o) => o.id === p.correct)!.text}`}</span>}
                  </label>
                  <select
                    id={`part-${i}`}
                    value={parts[i] ?? ""}
                    disabled={!!answered}
                    onChange={(e) => setParts((ps) => ps.map((x, j) => (j === i ? e.target.value : x)))}
                  >
                    <option value="">בחרי…</option>
                    {p.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.text}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="options" role={q.multi ? "group" : "radiogroup"} aria-labelledby="q-title">
            {q.options.map((o, i) => {
              const sel = chosen.includes(o.id);
              const isRight = q.correct.includes(o.id);
              const cls = answered ? (isRight ? "correct" : sel ? "wrong" : "") : "";
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`opt ${cls}`}
                  role={q.multi ? "checkbox" : "radio"}
                  aria-checked={sel}
                  disabled={!!answered}
                  onClick={() => toggle(o.id)}
                >
                  <span className="num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>
                    <RichText text={o.text} />
                    {answered && isRight && <span className="sr-only"> (תשובה נכונה)</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {answered && (
          <div className={`feedback ${answered.correct ? "good" : "bad"}`} role="status" aria-live="polite">
            <div className="title">{answered.correct ? "✓ נכון!" : "✗ לא נכון"}</div>
            {!answered.correct && q.safety && (
              <p className="notice safety">
                ⚠ טעות בנושא אלרגיה / גלוטן / מגבלה תזונתית. זה המקום שבו טעות מסוכנת לאורח — השאלה תחזור בתרגול הממוקד עד שתעני עליה נכון פעמיים.
              </p>
            )}
            <RichText text={q.explanation} />
            <SourceBadges sources={q.sources} />
          </div>
        )}
      </div>

      <div className="actions">
        {!answered ? (
          <button type="button" className="btn primary" onClick={submit} disabled={!ready}>
            {exam ? (idx + 1 >= keys.length ? "סיום המבחן" : "לשאלה הבאה") : "בדיקה"}
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={next} autoFocus>
            {idx + 1 >= keys.length ? "לסיכום" : "לשאלה הבאה"}
          </button>
        )}
      </div>
    </section>
  );
}

function Summary({
  mode,
  log,
  total,
  score,
  onRestart,
}: {
  mode: Mode;
  log: Answer[];
  total: number;
  score: number;
  onRestart: () => void;
}) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  const wrong = log.filter((a) => !a.correct);
  const safetyWrong = wrong.filter((a) => a.q.safety).length;
  return (
    <div className="stack">
      <div className="card stack">
        <h1>{mode === "exam" ? "תוצאות המבחן" : "סיום הסבב"}</h1>
        <div className="stats">
          <div className="stat">
            <span className="muted small">ציון</span>
            <b>{pct}</b>
          </div>
          <div className="stat">
            <span className="muted small">נכונות</span>
            <b>
              {score}/{total}
            </b>
          </div>
          <div className="stat">
            <span className="muted small">טעויות בטיחות</span>
            <b>{safetyWrong}</b>
          </div>
        </div>
        {mode === "exam" && log.length < total && <p className="notice">הזמן נגמר לפני שענית על כל השאלות — שאלות שלא נענו נספרות כשגויות.</p>}
        {safetyWrong > 0 && (
          <p className="notice safety">היו טעויות בנושאי אלרגיה / גלוטן. מומלץ לעבור עכשיו על התרגול הממוקד.</p>
        )}
        <div className="row">
          <button type="button" className="btn primary" onClick={onRestart}>
            סבב נוסף
          </button>
          {wrong.length > 0 && (
            <Link className="btn" href="/practice?mode=mistakes">
              חזרה על הטעויות
            </Link>
          )}
          {safetyWrong > 0 && (
            <Link className="btn" href="/practice?mode=safety">
              תרגול ממוקד
            </Link>
          )}
          <Link className="btn" href="/">
            למסך הבית
          </Link>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="stack">
          <h2>מה כדאי לחזור עליו</h2>
          {wrong.map((a, i) => (
            <div className="card" key={i}>
              <p style={{ fontWeight: 600 }}>
                <RichText text={a.q.prompt} />
              </p>
              {!a.q.parts && (
                <p>
                  התשובה הנכונה:{" "}
                  <b>
                    <RichText text={a.q.options.filter((o) => a.q.correct.includes(o.id)).map((o) => o.text).join(" · ") || "אף אחת"} />
                  </b>
                </p>
              )}
              <p className="muted small" style={{ whiteSpace: "pre-line" }}>
                <RichText text={a.q.explanation} />
              </p>
              <SourceBadges sources={a.q.sources} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
