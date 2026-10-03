import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Nav } from "@/components/Nav";

const rubik = Rubik({ subsets: ["hebrew", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: "תרגול תפריט — המחתרת התאילנדית",
  description: "תרגול לקראת מבחן התפריט, מבוסס על חוברת הלימוד בלבד",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#17130f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={rubik.className}>
        <a className="skip" href="#main">
          דילוג לתוכן
        </a>
        <header className="topbar">
          <div className="topbar-inner">
            <Link className="brand" href="/">
              המחתרת התאילנדית · תרגול תפריט
            </Link>
            <Nav />
          </div>
        </header>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
