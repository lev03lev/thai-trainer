// סנכרון התקדמות בין מכשירים לפי "קוד סנכרון".
// אחסון: Upstash Redis (דרך Vercel Marketplace). בלי משתני סביבה — מחזיר 503
// והאפליקציה ממשיכה לעבוד עם שמירה מקומית בלבד.

import { NextResponse } from "next/server";
import { emptyProgress, isProgressData, isValidCode, mergeProgress, normalizeCode, type ProgressData } from "@/lib/progress-core";

export const dynamic = "force-dynamic";

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX_BYTES = 1_500_000;

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const j = (await res.json()) as { result?: unknown; error?: string };
  if (j.error) throw new Error(j.error);
  return j.result;
}

const keyOf = (code: string) => `thai-trainer:progress:${code}`;

async function load(code: string): Promise<ProgressData> {
  const raw = await redis(["GET", keyOf(code)]);
  if (typeof raw !== "string") return emptyProgress();
  try {
    const p = JSON.parse(raw);
    return isProgressData(p) ? p : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function codeFrom(req: Request): string | null {
  const c = normalizeCode(new URL(req.url).searchParams.get("code") ?? "");
  return isValidCode(c) ? c : null;
}

export async function GET(req: Request) {
  if (!URL_ || !TOKEN) return NextResponse.json({ error: "sync-not-configured" }, { status: 503 });
  const code = codeFrom(req);
  if (!code) return NextResponse.json({ error: "bad-code" }, { status: 400 });
  try {
    return NextResponse.json(await load(code));
  } catch {
    return NextResponse.json({ error: "storage-error" }, { status: 502 });
  }
}

export async function PUT(req: Request) {
  if (!URL_ || !TOKEN) return NextResponse.json({ error: "sync-not-configured" }, { status: 503 });
  const code = codeFrom(req);
  if (!code) return NextResponse.json({ error: "bad-code" }, { status: 400 });
  const text = await req.text();
  if (text.length > MAX_BYTES) return NextResponse.json({ error: "too-large" }, { status: 413 });
  let incoming: unknown;
  try {
    incoming = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }
  if (!isProgressData(incoming)) return NextResponse.json({ error: "bad-data" }, { status: 400 });
  try {
    const merged = mergeProgress(await load(code), incoming);
    // שמירה לשנה; כל שמירה מאריכה את התוקף
    await redis(["SET", keyOf(code), JSON.stringify(merged), "EX", 60 * 60 * 24 * 365]);
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json({ error: "storage-error" }, { status: 502 });
  }
}
