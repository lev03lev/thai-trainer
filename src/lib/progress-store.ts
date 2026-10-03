"use client";

// מאגר ההתקדמות בדפדפן: שמירה מקומית תמיד, וסנכרון לשרת כשמוגדר קוד סנכרון.

import { useSyncExternalStore } from "react";
import {
  emptyProgress,
  isProgressData,
  isValidCode,
  mergeProgress,
  newCode,
  normalizeCode,
  type Attempt,
  type ExamResult,
  type ProgressData,
} from "./progress-core";

const LS_KEY = "thai-trainer:progress:v1";
const CODE_KEY = "thai-trainer:sync-code";

export type SyncStatus = "off" | "syncing" | "ok" | "error" | "not-configured";

const EMPTY = emptyProgress();
let state: ProgressData | null = null;
let code: string | null = null;
let status: SyncStatus = "off";
let lastSyncAt: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string | null) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* מצב גלישה פרטית וכו' — ממשיכים בזיכרון */
  }
}

function init() {
  if (state) return;
  const raw = safeGet(LS_KEY);
  try {
    const p = raw ? JSON.parse(raw) : null;
    state = isProgressData(p) ? p : emptyProgress();
  } catch {
    state = emptyProgress();
  }
  const c = safeGet(CODE_KEY);
  code = c && isValidCode(c) ? c : null;
  status = code ? "syncing" : "off";
  if (code) void syncNow();
}

function emit() {
  listeners.forEach((l) => l());
}

function save(next: ProgressData, scheduleSync = true) {
  state = next;
  safeSet(LS_KEY, JSON.stringify(next));
  emit();
  if (scheduleSync && code) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), 1200);
  }
}

export async function syncNow(): Promise<SyncStatus> {
  init();
  if (!code) {
    status = "off";
    emit();
    return status;
  }
  status = "syncing";
  emit();
  try {
    const res = await fetch(`/api/progress?code=${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (res.status === 503) status = "not-configured";
    else if (!res.ok) status = "error";
    else {
      const merged = await res.json();
      if (isProgressData(merged)) save(mergeProgress(state!, merged), false);
      status = "ok";
      lastSyncAt = Date.now();
    }
  } catch {
    status = "error";
  }
  emit();
  return status;
}

export function recordAttempt(a: Omit<Attempt, "id" | "ts">) {
  init();
  const att: Attempt = { ...a, id: crypto.randomUUID(), ts: Date.now() };
  save({ ...state!, attempts: [...state!.attempts, att] });
}

export function recordExam(e: Omit<ExamResult, "id" | "ts">) {
  init();
  save({ ...state!, exams: [...state!.exams, { ...e, id: crypto.randomUUID(), ts: Date.now() }] });
}

export function setLastMode(mode: string) {
  init();
  save({ ...state!, lastMode: { mode, ts: Date.now() } });
}

export function resetLocalProgress() {
  init();
  save(emptyProgress(), false);
}

/** קריאה ישירה (לא דרך React) — מחזירה את הנתונים שנשמרו בדפדפן */
export function getProgress(): ProgressData {
  init();
  return state!;
}

// ---------- קוד סנכרון ----------
export function getSyncCode() {
  init();
  return code;
}

export function createSyncCode(): string {
  const c = newCode((n) => crypto.getRandomValues(new Uint32Array(1))[0] % n);
  connectSyncCode(c);
  return c;
}

export function connectSyncCode(input: string): boolean {
  const c = normalizeCode(input);
  if (!isValidCode(c)) return false;
  code = c;
  safeSet(CODE_KEY, c);
  void syncNow();
  return true;
}

export function disconnectSync() {
  code = null;
  safeSet(CODE_KEY, null);
  status = "off";
  emit();
}

// ---------- React ----------
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress(): ProgressData {
  return useSyncExternalStore(
    subscribe,
    () => {
      init();
      return state!;
    },
    () => EMPTY,
  );
}

let syncSnap: { status: SyncStatus; code: string | null; lastSyncAt: number | null } = { status, code, lastSyncAt };
export function useSync() {
  return useSyncExternalStore(
    subscribe,
    () => {
      init();
      if (syncSnap.status !== status || syncSnap.code !== code || syncSnap.lastSyncAt !== lastSyncAt)
        syncSnap = { status, code, lastSyncAt };
      return syncSnap;
    },
    () => SERVER_SYNC,
  );
}
const SERVER_SYNC = { status: "off" as SyncStatus, code: null as string | null, lastSyncAt: null as number | null };
