"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "בית" },
  { href: "/study", label: "המנות" },
  { href: "/progress", label: "התקדמות" },
  { href: "/review", label: "בדיקת תוכן" },
  { href: "/settings", label: "סנכרון" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="ניווט ראשי">
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
