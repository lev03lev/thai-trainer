import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DISHES, DISH_BY_ID } from "@/data/menu";
import { ISSUE_BY_ID } from "@/data/issues";
import type { Fact, Source } from "@/data/types";
import { RichText } from "@/components/RichText";

export function generateStaticParams() {
  return DISHES.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const d = DISH_BY_ID.get((await params).id);
  return { title: d ? `${d.name.value} — המחתרת התאילנדית` : "מנה" };
}

function Src({ s }: { s: Source }) {
  return (
    <span className={`badge ${s.kind === "handwritten" ? "hand" : ""}`}>
      עמ׳ {s.page} · {s.kind === "handwritten" ? "כתב יד" : "מודפס"}
    </span>
  );
}

function Pending({ issue }: { issue?: string }) {
  const i = issue ? ISSUE_BY_ID.get(issue) : undefined;
  return (
    <span className="badge pending">
      ממתין לבירור{i ? ` — ${i.title}` : ""} · <Link href={`/review#${issue}`}>פרטים</Link>
    </span>
  );
}

function Row<T>({ label, fact, render }: { label: string; fact?: Fact<T>; render?: (f: Fact<T>) => ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>
        {!fact ? (
          <span className="muted">לא מצוין בחוברת (לא ידוע — לבדוק מול המטבח)</span>
        ) : fact.status === "pending" ? (
          <Pending issue={fact.issue} />
        ) : (
          <>
            {render ? render(fact) : <RichText text={String(fact.value)} />} <Src s={fact.src} />
          </>
        )}
      </dd>
    </>
  );
}

export default async function DishPage({ params }: { params: Promise<{ id: string }> }) {
  const d = DISH_BY_ID.get((await params).id);
  if (!d) notFound();
  const quote = (f: Fact<unknown>) => <RichText text={`״${f.src.quote}״`} />;
  const handApproved = d.hand.filter((h) => h.status === "approved" && h.field !== "extra-dish" && h.field !== "strike" && h.field !== "notes");
  const handPending = d.hand.filter((h) => h.status === "pending");

  return (
    <div className="stack">
      <p className="small">
        <Link href="/study">← כל המנות</Link>
      </p>
      <div className="card stack">
        {d.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="q-img" src={d.image.value} alt={`איור של ${d.name.value} מתוך החוברת`} />
        )}
        <h1 style={{ margin: 0 }}>
          <RichText text={d.name.value} />
        </h1>
        {d.latin && (
          <p className="muted" style={{ margin: 0 }}>
            <bdi dir="ltr">{d.latin.value}</bdi>
          </p>
        )}
        {d.aka && (
          <p className="muted" style={{ margin: 0 }}>
            שם נוסף: {d.aka.value} <Src s={d.aka.src} />
          </p>
        )}
        {d.handwrittenDish && (
          <p className="notice" style={{ margin: 0 }}>
            המנה הזו מתוארת בחוברת רק בכתב יד (בתחתית עמוד {d.page}), ואין לה איור. מה שלא מצוין כאן — לא ידוע.
          </p>
        )}
        <div className="row">
          <Link className="btn primary" href={`/practice?mode=dish&dish=${d.id}`}>
            לתרגל את המנה הזו
          </Link>
          <span className="muted small">עמוד {d.page} בחוברת · קטגוריה: לא ידוע (<Link href="/review#def-category">ממתין</Link>)</span>
        </div>
      </div>

      <div className="card">
        <dl className="facts">
          <Row label="תיאור המנה ומרכיבים" fact={d.description} />
          <Row label="משפט תיאור למלצרים" fact={d.waiter} />
          <Row label="אלרגנים (כפי שרשומים בחוברת)" fact={d.allergens} render={(f) => (f.value as string[]).join(", ")} />
          <Row label="גלוטן" fact={d.gluten} render={quote} />
          <Row label="מוצרי חלב" fact={d.dairy} render={quote} />
          <Row label="MSG" fact={d.msg} render={quote} />
          <Row label="רמת חריפות" fact={d.spice} render={quote} />
          <Row label="טעמים חזקים" fact={d.strong} />
          <dt>שינויים אפשריים</dt>
          <dd>
            {d.changesYes.length + d.changesNo.length === 0 ? (
              <span className="muted">לא מצוין בחוברת</span>
            ) : (
              <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                {d.changesYes.map((c, i) => (
                  <li key={`y${i}`}>
                    <RichText text={c.value} />
                  </li>
                ))}
                {d.changesNo.map((c, i) => (
                  <li key={`n${i}`}>
                    <RichText text={c.value} />
                  </li>
                ))}
              </ul>
            )}
          </dd>
          {d.variants.length > 0 && (
            <>
              <dt>גרסאות ושינויים מותנים</dt>
              <dd>
                <p className="muted small">התאמה של גרסה אחרת לא הופכת את הגרסה הרגילה למתאימה.</p>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {d.variants.map((v, i) => (
                    <li key={i}>
                      <b>{v.label}:</b>{" "}
                      {v.status === "pending" ? <Pending issue={v.issue} /> : <RichText text={v.detail} />}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
          {(d.notes.length > 0 || handApproved.length > 0) && (
            <>
              <dt>הערות</dt>
              <dd>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {d.notes.map((n, i) => (
                    <li key={i}>
                      <RichText text={n.value} /> <Src s={n.src} />
                    </li>
                  ))}
                  {handApproved.map((h, i) => (
                    <li key={`h${i}`}>
                      <RichText text={h.text} /> <Src s={h.src} />
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
          {handPending.length > 0 && (
            <>
              <dt>כתב יד שממתין לבירור</dt>
              <dd>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {[...new Set(handPending.map((h) => h.issue))].map((id) => (
                    <li key={id}>
                      <Pending issue={id} />
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
