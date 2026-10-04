"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePreferences } from "@/lib/preferences/store";
import { Avatar } from "./Avatar";

/** אזור המשתמש בסרגל העליון: אווטר + שם, מוביל להתאמה האישית */
export function UserChip() {
  const p = usePreferences();
  const active = usePathname().startsWith("/personalize");
  // עד שהדף נטען בדפדפן ההעדפות עוד לא ידועות — מציגים שלד ניטרלי במקום הבהוב של ברירת המחדל
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <span className="user-chip is-loading" aria-hidden="true">
        <span className="avatar skeleton" style={{ width: 32, height: 32 }} />
        <span className="user-chip-name skeleton-line" />
      </span>
    );
  }

  const name = p.displayName || "התאמה אישית";
  return (
    <Link
      href="/personalize"
      className="user-chip"
      aria-current={active ? "page" : undefined}
      aria-label={p.displayName ? `הפרופיל של ${p.displayName} — התאמה אישית` : "התאמה אישית: שם, אווטר וערכת עיצוב"}
    >
      <Avatar id={p.avatarId} name={p.displayName} size={32} />
      <span className="user-chip-name">{name}</span>
    </Link>
  );
}
