import Link from "next/link";
import { DISHES } from "@/data/menu";
import { RichText } from "@/components/RichText";

export const metadata = { title: "המנות — המחתרת התאילנדית" };

export default function StudyPage() {
  return (
    <div className="stack">
      <h1>כל המנות</h1>
      <p className="muted">
        לחצי על מנה כדי לראות את כל מה שכתוב עליה בחוברת, ומשם לתרגל רק אותה. המנות מסודרות לפי סדר העמודים בחוברת.
      </p>
      <div className="grid">
        {DISHES.map((d) => (
          <article key={d.id} className="card dish-card">
            <Link href={`/study/${d.id}`}>
              {d.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.image.value} alt="" loading="lazy" />
              )}
              <h3>
                <RichText text={d.name.value} />
              </h3>
              {d.latin && (
                <p className="muted small" style={{ margin: 0 }}>
                  <bdi dir="ltr">{d.latin.value}</bdi>
                </p>
              )}
              <p className="muted small" style={{ margin: 0 }}>
                עמ׳ {d.page}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
