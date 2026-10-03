import Link from "next/link";
import type { ReactNode } from "react";
import { DISHES } from "@/data/menu";
import { ISSUES } from "@/data/issues";
import type { Dish, Fact } from "@/data/types";
import { RichText } from "@/components/RichText";

export const metadata = { title: "בדיקת תוכן — המחתרת התאילנדית" };

const KIND_LABEL = {
  conflict: "סתירה",
  handwriting: "כתב יד לא ברור",
  definition: "הגדרה חסרה",
  missing: "טקסט חסר",
  service: "שירות",
} as const;

function cell<T>(f: Fact<T> | undefined, show: (v: T) => string): ReactNode {
  if (!f) return <td className="u">לא ידוע</td>;
  if (f.status === "pending")
    return (
      <td>
        <a className="badge pending" href={`#${f.issue}`}>
          ממתין
        </a>
      </td>
    );
  return (
    <td>
      <RichText text={show(f.value)} />
      {f.src.kind === "handwritten" && <span className="badge hand"> כתב יד</span>}
    </td>
  );
}

const g = (v: string) => (v === "contains" ? "מכיל" : "ללא");

function variantsText(d: Dish) {
  return d.variants.map((v) => `${v.label}${v.status === "pending" ? " (ממתין)" : ""}`).join("; ");
}

export default function ReviewPage() {
  const pendingFacts = DISHES.reduce(
    (n, d) =>
      n +
      [d.waiter, d.allergens, d.gluten, d.dairy, d.spice].filter((f) => f?.status === "pending").length +
      d.hand.filter((h) => h.status === "pending").length,
    0,
  );
  return (
    <div className="stack">
      <h1>בדיקת תוכן</h1>
      <p>
        העמוד הזה מיועד לבדיקה לפני שמשתמשים במערכת ללימוד. כל עובדה נשמרת עם עמוד המקור ועם סוג המקור (מודפס או כתב יד). שדה ריק = <b>לא ידוע</b>, ולא ״אין״.
        עובדה שממתינה לבירור ({pendingFacts} כרגע) חסומה: היא לא מופיעה בשאלות, בתשובות או בתרחישים.
      </p>
      <p className="notice">
        עריכת התוכן אפשרית רק דרך הקוד (<bdi dir="ltr">src/data/menu-spec.ts</bdi>) — אין עריכה מהדפדפן. כל שינוי עובר את הבדיקות האוטומטיות, שמוודאות שכל תשובה נכונה היא ציטוט מהחוברת.
      </p>

      <h2 id="table">טבלת סקירה: כל המנות והמאפיינים</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>עמ׳</th>
              <th>מנה</th>
              <th>משפט מלצרים</th>
              <th>אלרגנים</th>
              <th>גלוטן</th>
              <th>חלב</th>
              <th>MSG</th>
              <th>חריפות</th>
              <th>טעמים חזקים</th>
              <th>שינויים</th>
              <th>גרסאות</th>
              <th>הערות</th>
              <th>תמונה</th>
            </tr>
          </thead>
          <tbody>
            {DISHES.map((d) => (
              <tr key={d.id}>
                <td>{d.page}</td>
                <td>
                  <Link href={`/study/${d.id}`}>
                    <RichText text={d.name.value} />
                  </Link>
                </td>
                {cell(d.waiter, () => "✓")}
                {cell(d.allergens, (v) => v.join(", "))}
                {cell(d.gluten, g)}
                {cell(d.dairy, g)}
                {cell(d.msg, (v) => (v.has ? (v.removable === false ? "יש (אי אפשר להוציא)" : v.removable ? "יש (אפשר להוציא)" : "יש") : "אין"))}
                {cell(d.spice, (v) => (v.level !== undefined ? `${v.level}/10` : v.text))}
                {cell(d.strong, (v) => v)}
                <td className={d.changesYes.length + d.changesNo.length ? "" : "u"}>
                  {d.changesYes.length + d.changesNo.length ? `${d.changesYes.length} אפשר · ${d.changesNo.length} אי אפשר` : "לא ידוע"}
                </td>
                <td className={d.variants.length ? "" : "u"}>{d.variants.length ? variantsText(d) : "—"}</td>
                <td>
                  {d.notes.length + d.hand.filter((h) => h.status === "approved" && h.field === "service").length || "—"}
                  {d.hand.some((h) => h.status === "pending") && (
                    <>
                      {" "}
                      <span className="badge pending">כתב יד ממתין</span>
                    </>
                  )}
                </td>
                <td>{d.image ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="issues">שאלות פתוחות ({ISSUES.length})</h2>
      <p className="muted">
        לכל שאלה: המנה, העמוד, צילום החלק הרלוונטי מהסריקה, מה אפשר לקרוא שם, ומה צריך להכריע. אחרי ההכרעה אעדכן את הנתונים ואשחרר את החסימה.
      </p>
      {ISSUES.map((i, n) => (
        <article key={i.id} id={i.id} className="card stack">
          <div className="row">
            <span className="badge">{n + 1}</span>
            <span className={`badge ${i.kind === "conflict" ? "bad" : "pending"}`}>{KIND_LABEL[i.kind]}</span>
            {i.page && <span className="badge">עמ׳ {i.page}</span>}
          </div>
          <h3>
            <RichText text={i.title} />
          </h3>
          {i.crops.map((c) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={c} className="crop" src={c} alt={`צילום מתוך הסריקה: ${i.title}`} loading="lazy" />
          ))}
          <div>
            <b>מה כתוב / קריאות אפשריות:</b>
            <ul style={{ margin: "4px 0", paddingInlineStart: 20 }}>
              {i.readings.map((r, k) => (
                <li key={k}>
                  <RichText text={r} />
                </li>
              ))}
            </ul>
          </div>
          <p>
            <b>השאלה:</b> <RichText text={i.question} />
          </p>
          <p className="muted small">חסום עד להכרעה: {i.blocks}</p>
        </article>
      ))}
    </div>
  );
}
