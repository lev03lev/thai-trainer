"use client";

// מאגר ההעדפות בדפדפן (ערכה, שם תצוגה, אווטר). אותו דפוס כמו progress-store:
// useSyncExternalStore + שכבת אחסון שאפשר להחליף.

import { useSyncExternalStore } from "react";
import { isKnownAvatar } from "@/avatars/avatars";
import type { AvatarConfig } from "@/avatars/catalog";
import { applyTheme, applyThemeAnimated } from "@/themes/apply";
import type { ThemeChoice } from "@/themes/themes";
import { cleanName, defaultPreferences, looseConfig, normalizeAvatar, sanitizePreferences, type UserPreferences } from "./model";
import { localStorageRepository, type PreferencesRepository } from "./repository";

const repo: PreferencesRepository = localStorageRepository;
const known = isKnownAvatar;
const SERVER = defaultPreferences();

let state: UserPreferences | null = null;
const listeners = new Set<() => void>();

function init() {
  if (state) return;
  state = normalizeAvatar(sanitizePreferences(repo.load(), known));
  // נרשם פעם אחת לכל חיי הדף
  repo.subscribe?.((raw) => {
    state = normalizeAvatar(sanitizePreferences(raw, known));
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

/** החלפת ערכה: מיידית בדף (עם מעבר עדין מנקודת הלחיצה) ונשמרת */
export function setTheme(theme: ThemeChoice, origin?: { x: number; y: number }) {
  init();
  applyThemeAnimated(theme, origin);
  commit({ ...state!, theme });
}

export function saveProfile(profile: { displayName: string; avatarId: string | null; avatarCustom?: AvatarConfig | null }) {
  init();
  commit(
    normalizeAvatar({
      ...state!,
      displayName: cleanName(profile.displayName),
      avatarId: profile.avatarId && known(profile.avatarId) ? profile.avatarId : null,
      // ההגדרה המעוצבת נשמרת גם כשבוחרים אווטר אחר — כדי שלא תאבד
      avatarCustom: profile.avatarCustom === undefined ? state!.avatarCustom : looseConfig(profile.avatarCustom),
    }),
  );
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
