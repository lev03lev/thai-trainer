import { Fragment, type ReactNode } from "react";

// מונע שיבושי כיווניות: כל רצף לטיני (שמות לועזיים, MSG, 5/10) נעטף ב-<bdi dir="ltr">.
// *טקסט* מוצג בהדגשה.
const LATIN = /([A-Za-z][A-Za-z0-9 |'.-]*[A-Za-z0-9]|[A-Za-z]|\d+(?:\.\d+)?\/\d+)/g;

function latin(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(LATIN)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    out.push(
      <bdi dir="ltr" key={`${keyBase}-${i++}`}>
        {m[0]}
      </bdi>,
    );
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
          <strong key={i}>{latin(p.slice(1, -1), `b${i}`)}</strong>
        ) : (
          <Fragment key={i}>{latin(p, `t${i}`)}</Fragment>
        ),
      )}
    </>
  );
}
