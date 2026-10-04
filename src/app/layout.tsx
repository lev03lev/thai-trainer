import type { Metadata, Viewport } from "next";
import { Rubik, Secular_One, Suez_One, Varela_Round } from "next/font/google";
import "./globals.css";
import "./personalize.css";
import "./personalize-studio.css";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { UserChip } from "@/components/UserChip";
import { DEFAULT_DARK, DEFAULT_LIGHT, THEME_BY_ID, themeCss } from "@/themes/themes";
import { themeBootScript } from "@/themes/apply";

// גופנים עבריים. כל ערכת עיצוב בוחרת גופן לטקסט ולכותרות (src/themes/themes.ts)
const rubik = Rubik({ subsets: ["hebrew", "latin"], display: "swap", variable: "--font-rubik" });
const round = Varela_Round({ subsets: ["hebrew", "latin"], weight: "400", display: "swap", variable: "--font-round", preload: false });
const display = Secular_One({ subsets: ["hebrew", "latin"], weight: "400", display: "swap", variable: "--font-display", preload: false });
const serif = Suez_One({ subsets: ["hebrew", "latin"], weight: "400", display: "swap", variable: "--font-serif", preload: false });
const fontVars = [rubik.variable, round.variable, display.variable, serif.variable].join(" ");

export const metadata: Metadata = {
  title: "תרגול תפריט — המחתרת התאילנדית",
  description: "תרגול לקראת מבחן התפריט, מבוסס על חוברת הלימוד בלבד",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_BY_ID.get(DEFAULT_LIGHT)!.tokens.bg },
    { media: "(prefers-color-scheme: dark)", color: THEME_BY_ID.get(DEFAULT_DARK)!.tokens.bg },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: הסקריפט ב-head מוסיף data-theme לפני שה-React נטען
    <html lang="he" dir="rtl" className={fontVars} suppressHydrationWarning>
      <head>
        <style id="themes" dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
      </head>
      <body>
        <a className="skip" href="#main">
          דילוג לתוכן
        </a>
        <header className="topbar">
          <div className="topbar-inner">
            <Link className="brand" href="/">
              המחתרת התאילנדית · תרגול תפריט
            </Link>
            <Nav />
            <UserChip />
          </div>
        </header>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
