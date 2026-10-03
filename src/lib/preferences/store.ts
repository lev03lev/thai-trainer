"use client";

// מאגר ההעדפות בדפדפן (ערכה, שם תצוגה, אווטר). אותו דפוס כמו progress-store:
// useSyncExternalStore + שכבת אחסון שאפשר להחליף.

import { useSyncExternalStore } from "react";
import { AVATAR_BY_ID } from "@/avatars/avatars";
import { applyTheme } from "@/themes/apply";
import type { ThemeChoice } from "@/themes/themes";
import { cleanName, defaultPreferences, sanitizePreferences, type UserPreferences } from "./model";
import { localStorageRepository, type PreferencesRepository } from "./repository";

const repo: PreferencesRepository = localStorageRepository;
const known = (id: string) => AVATAR_BY_ID.has(id);
const SERVER = defaultPreferences();

let state: UserPreferences | null = null;
const listeners = new Set<() => void>();

function init() {
  if (state) return;
  state = sanitizePreferences(repo.load(), known);
  // נרשם פעם אחת לכל חיי הדף
  repo.subscribe?.((raw) => {
    state = sanitizePreferences(raw, known);
    applyTheme(state.theme);
    emit();
  });
  // אם המכשיר עובר בין יום ללילה ונבחר "לפי המכשיר" — לעדכן את צבע הסרגל
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (state?.theme === "system") applyTheme("system");
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: UserPreferences) {
  state = { ...next, updatedAt: Date.now() };
  repo.save(state);
  emit();
}

export function getPreferences(): UserPreferences {
  init();
  return state!;
}

/** החלפת ערכה: מיידית בדף ונשמרת */
export function setTheme(theme: ThemeChoice) {
  init();
  applyTheme(theme);
  commit({ ...state!, theme });
}

export function saveProfile(profile: { displayName: string; avatarId: string | null }) {
  init();
  commit({
    ...state!,
    displayName: cleanName(profile.displayName),
    avatarId: profile.avatarId && known(profile.avatarId) ? profile.avatarId : null,
  });
}

export function resetPreferences() {
  init();
  applyTheme("system");
  commit(defaultPreferences());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function usePreferences(): UserPreferences {
  return useSyncExternalStore(subscribe, getPreferences, () => SERVER);
}
