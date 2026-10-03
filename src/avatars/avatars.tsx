// בנק האווטרים: איורי SVG שטוחים בסגנון אחיד (בלי קבצים חיצוניים).
// לאיורים יש פלטת צבעים משלהם (זו אמנות, לא צבעי ממשק), ולכן הם מחוץ למערכת הערכות.
// להוספת אווטר: מוסיפים רשומה ל-FACES או ל-FOODS.

import type { ReactNode } from "react";

export interface AvatarDef {
  id: string;
  label: string;
  category: "faces" | "food";
  art: ReactNode;
}

export const AVATAR_CATEGORIES = [
  { id: "faces", label: "דמויות" },
  { id: "food", label: "מהמטבח" },
] as const;

// ---------- דמויות ----------
type Eyes = "dot" | "oval" | "happy" | "wink";
type Mouth = "smile" | "open" | "flat" | "grin";
type Extra = "none" | "cheeks" | "bun" | "band" | "freckles" | "glasses" | "sprout";

interface FaceSpec {
  bg: string;
  face: string;
  ink: string;
  accent: string;
  shape: "round" | "squircle";
  eyes: Eyes;
  mouth: Mouth;
  extra: Extra;
  tilt: number;
}

function Face({ f }: { f: FaceSpec }) {
  const eyeY = 41;
  const eyes: Record<Eyes, ReactNode> = {
    dot: (
      <>
        <circle cx="31" cy={eyeY} r="3.2" fill={f.ink} />
        <circle cx="49" cy={eyeY} r="3.2" fill={f.ink} />
      </>
    ),
    oval: (
      <>
        <ellipse cx="31" cy={eyeY} rx="2.6" ry="4" fill={f.ink} />
        <ellipse cx="49" cy={eyeY} rx="2.6" ry="4" fill={f.ink} />
      </>
    ),
    happy: (
      <g stroke={f.ink} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d={`M27 ${eyeY + 1} q4 -5 8 0`} />
        <path d={`M45 ${eyeY + 1} q4 -5 8 0`} />
      </g>
    ),
    wink: (
      <>
        <circle cx="31" cy={eyeY} r="3.2" fill={f.ink} />
        <path d={`M45 ${eyeY + 1} q4 -4 8 0`} stroke={f.ink} strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
  };
  const mouth: Record<Mouth, ReactNode> = {
    smile: <path d="M33 51 q7 7 14 0" stroke={f.ink} strokeWidth="3" strokeLinecap="round" fill="none" />,
    open: <ellipse cx="40" cy="53" rx="5" ry="4" fill={f.ink} />,
    flat: <path d="M34 53 h12" stroke={f.ink} strokeWidth="3" strokeLinecap="round" />,
    grin: <path d="M32 50 h16 q-8 10 -16 0z" fill={f.ink} />,
  };
  const extra: Record<Extra, ReactNode> = {
    none: null,
    cheeks: (
      <>
        <circle cx="26" cy="49" r="3.6" fill={f.accent} opacity="0.55" />
        <circle cx="54" cy="49" r="3.6" fill={f.accent} opacity="0.55" />
      </>
    ),
    bun: <circle cx="40" cy="17" r="8" fill={f.accent} />,
    band: <rect x="17" y="25" width="46" height="6" rx="3" fill={f.accent} />,
    freckles: (
      <g fill={f.accent}>
        <circle cx="27" cy="48" r="1.3" />
        <circle cx="30" cy="51" r="1.3" />
        <circle cx="25" cy="52" r="1.3" />
        <circle cx="53" cy="48" r="1.3" />
        <circle cx="50" cy="51" r="1.3" />
        <circle cx="55" cy="52" r="1.3" />
      </g>
    ),
    glasses: (
      <g stroke={f.ink} strokeWidth="2.2" fill="none">
        <circle cx="31" cy={eyeY} r="6.5" />
        <circle cx="49" cy={eyeY} r="6.5" />
        <path d={`M37.5 ${eyeY} h5`} />
      </g>
    ),
    sprout: (
      <g>
        <path d="M40 22 v-7" stroke={f.ink} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M40 16 q-8 -6 -12 1 q7 3 12 -1z" fill={f.accent} />
        <path d="M40 16 q8 -6 12 1 q-7 3 -12 -1z" fill={f.accent} />
      </g>
    ),
  };
  return (
    <>
      <circle cx="40" cy="40" r="40" fill={f.bg} />
      {(f.extra === "bun" || f.extra === "sprout") && extra[f.extra]}
      <g transform={`rotate(${f.tilt} 40 44)`}>
        {f.shape === "round" ? <circle cx="40" cy="44" r="23" fill={f.face} /> : <rect x="17" y="21" width="46" height="46" rx="16" fill={f.face} />}
        {f.extra === "band" && extra.band}
        {eyes[f.eyes]}
        {mouth[f.mouth]}
        {(f.extra === "cheeks" || f.extra === "freckles" || f.extra === "glasses") && extra[f.extra]}
      </g>
    </>
  );
}

const FACE_SPECS: FaceSpec[] = [
  { bg: "#FFD9B8", face: "#FF8A5B", ink: "#3A1F14", accent: "#FFE7A0", shape: "round", eyes: "dot", mouth: "smile", extra: "cheeks", tilt: -6 },
  { bg: "#CDE7FF", face: "#4C7DFF", ink: "#0F1B40", accent: "#FFD166", shape: "squircle", eyes: "oval", mouth: "grin", extra: "band", tilt: 4 },
  { bg: "#D8F5E3", face: "#2FBF71", ink: "#0C2E1C", accent: "#F7F052", shape: "round", eyes: "happy", mouth: "open", extra: "sprout", tilt: 0 },
  { bg: "#F5D9FF", face: "#B25CF0", ink: "#26103A", accent: "#FF9ECF", shape: "squircle", eyes: "wink", mouth: "smile", extra: "cheeks", tilt: -8 },
  { bg: "#FFF1B8", face: "#FFC23D", ink: "#3D2A00", accent: "#FF7A59", shape: "round", eyes: "dot", mouth: "grin", extra: "freckles", tilt: 6 },
  { bg: "#FFD3DA", face: "#FF5C7A", ink: "#3B0C17", accent: "#FFE3B3", shape: "squircle", eyes: "happy", mouth: "smile", extra: "bun", tilt: 0 },
  { bg: "#D4F3F1", face: "#1FB5A8", ink: "#06302C", accent: "#FFEFA3", shape: "round", eyes: "oval", mouth: "flat", extra: "glasses", tilt: -4 },
  { bg: "#E4E2FF", face: "#6B5CFF", ink: "#16123D", accent: "#7EF0D8", shape: "round", eyes: "dot", mouth: "open", extra: "band", tilt: 8 },
  { bg: "#FFE2C7", face: "#E8743B", ink: "#331607", accent: "#FFC0A8", shape: "squircle", eyes: "dot", mouth: "smile", extra: "glasses", tilt: -3 },
  { bg: "#DDF6C9", face: "#8AC926", ink: "#1E3005", accent: "#FF9F1C", shape: "round", eyes: "wink", mouth: "grin", extra: "cheeks", tilt: 5 },
  { bg: "#CFEFFF", face: "#38B6FF", ink: "#062A40", accent: "#FFD6E8", shape: "squircle", eyes: "happy", mouth: "open", extra: "freckles", tilt: -6 },
  { bg: "#FFE0EF", face: "#F062A8", ink: "#3A0A22", accent: "#FFF3B0", shape: "round", eyes: "oval", mouth: "smile", extra: "bun", tilt: 3 },
  { bg: "#E9E3D6", face: "#9C6B3F", ink: "#22140A", accent: "#F2C14E", shape: "round", eyes: "happy", mouth: "smile", extra: "band", tilt: -2 },
  { bg: "#DCE6FF", face: "#2D3A8C", ink: "#F5F7FF", accent: "#FF6F91", shape: "squircle", eyes: "dot", mouth: "smile", extra: "cheeks", tilt: 6 },
  { bg: "#FFF4D6", face: "#F4A261", ink: "#3A2109", accent: "#2A9D8F", shape: "squircle", eyes: "oval", mouth: "grin", extra: "sprout", tilt: -5 },
  { bg: "#E3FAF3", face: "#06D6A0", ink: "#04332A", accent: "#118AB2", shape: "round", eyes: "wink", mouth: "open", extra: "glasses", tilt: 2 },
  { bg: "#FDE2E4", face: "#E63946", ink: "#FFF5F5", accent: "#FFB4A2", shape: "round", eyes: "dot", mouth: "grin", extra: "band", tilt: -7 },
  { bg: "#EDE7F6", face: "#3D2C5E", ink: "#F4EEFF", accent: "#C3A6FF", shape: "squircle", eyes: "happy", mouth: "smile", extra: "freckles", tilt: 4 },
];

const FACES: AvatarDef[] = FACE_SPECS.map((f, i) => ({
  id: `face-${String(i + 1).padStart(2, "0")}`,
  label: `דמות ${i + 1}`,
  category: "faces",
  art: <Face f={f} />,
}));

// ---------- מהמטבח ----------
const bg = (c: string) => <circle cx="40" cy="40" r="40" fill={c} />;
const chopsticks = (
  <g stroke="#B9824A" strokeWidth="3" strokeLinecap="round">
    <path d="M47 13 L58 40" />
    <path d="M54 11 L62 39" />
  </g>
);

const FOODS: AvatarDef[] = [
  {
    id: "food-chili",
    label: "צ'ילי",
    category: "food",
    art: (
      <>
        {bg("#FFE1D9")}
        <path d="M22 57 C30 62 49 58 56 40 C59 32 58 27 55 24 C50 31 46 40 36 46 C30 50 25 53 22 57 Z" fill="#E63B2E" />
        <path d="M30 53 C38 52 45 46 50 36" stroke="#FF8A7A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M55 24 C56 19 59 16 63 15" stroke="#3F8F3A" strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="54.5" cy="25" rx="6" ry="3.4" fill="#4CAF50" transform="rotate(-30 54.5 25)" />
      </>
    ),
  },
  {
    id: "food-lime",
    label: "ליים",
    category: "food",
    art: (
      <>
        {bg("#E5F6D3")}
        <circle cx="40" cy="40" r="23" fill="#4E9A26" />
        <circle cx="40" cy="40" r="19" fill="#C7EA86" />
        <g stroke="#9BCF52" strokeWidth="2.2">
          {[0, 45, 90, 135].map((a) => (
            <path key={a} d="M40 22 V58" transform={`rotate(${a} 40 40)`} />
          ))}
        </g>
        <circle cx="40" cy="40" r="3" fill="#F2FBE0" />
      </>
    ),
  },
  {
    id: "food-coconut",
    label: "קוקוס",
    category: "food",
    art: (
      <>
        {bg("#F3E6D8")}
        <circle cx="38" cy="45" r="21" fill="#7A4A2A" />
        <ellipse cx="38" cy="41" rx="17" ry="12" fill="#FFFDF5" />
        <ellipse cx="38" cy="41" rx="17" ry="12" fill="none" stroke="#5E3720" strokeWidth="2.5" />
        <path d="M44 38 L58 14" stroke="#FF6B6B" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M51 26 L55 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "food-rice",
    label: "קערת אורז",
    category: "food",
    art: (
      <>
        {bg("#E1ECFF")}
        {chopsticks}
        <path d="M22 42 Q40 18 58 42 Z" fill="#FFFFFF" />
        <g fill="#DCE3F0">
          <ellipse cx="35" cy="35" rx="1.6" ry="2.6" transform="rotate(30 35 35)" />
          <ellipse cx="42" cy="31" rx="1.6" ry="2.6" transform="rotate(-20 42 31)" />
          <ellipse cx="47" cy="37" rx="1.6" ry="2.6" transform="rotate(40 47 37)" />
          <ellipse cx="30" cy="40" rx="1.6" ry="2.6" />
        </g>
        <path d="M17 42 H63 A23 20 0 0 1 17 42 Z" fill="#3D6FB6" />
        <path d="M24 50 H56" stroke="#7FA6E0" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "food-noodles",
    label: "נודלס",
    category: "food",
    art: (
      <>
        {bg("#FFEFCF")}
        {chopsticks}
        <g stroke="#F6C453" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M33 42 C30 34 38 30 35 22" />
          <path d="M40 42 C37 34 45 30 42 20" />
          <path d="M47 42 C44 34 52 32 50 24" />
        </g>
        <path d="M17 42 H63 A23 20 0 0 1 17 42 Z" fill="#E4572E" />
        <path d="M22 47 H58" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "food-dumpling",
    label: "כיסון",
    category: "food",
    art: (
      <>
        {bg("#ECE6FF")}
        <g stroke="#B9A8F0" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M32 22 q-3 -4 0 -8" />
          <path d="M40 20 q-3 -4 0 -8" />
          <path d="M48 22 q-3 -4 0 -8" />
        </g>
        <path d="M14 52 Q40 16 66 52 Q40 63 14 52 Z" fill="#FFF7EA" stroke="#E8D5B5" strokeWidth="2" />
        <g stroke="#E2C9A0" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M26 41 q2 4 0 8" />
          <path d="M33 35 q2 5 0 10" />
          <path d="M40 33 q2 5 0 11" />
          <path d="M47 35 q2 5 0 10" />
          <path d="M54 41 q2 4 0 8" />
        </g>
      </>
    ),
  },
  {
    id: "food-mango",
    label: "מנגו",
    category: "food",
    art: (
      <>
        {bg("#FFF2C4")}
        <ellipse cx="40" cy="45" rx="19" ry="23" fill="#FFB627" transform="rotate(-28 40 45)" />
        <ellipse cx="46" cy="52" rx="10" ry="12" fill="#FF8C2B" transform="rotate(-28 46 52)" />
        <ellipse cx="33" cy="38" rx="4" ry="7" fill="#FFE08A" transform="rotate(-28 33 38)" />
        <path d="M44 23 C48 14 58 14 62 17 C57 23 50 25 44 23 Z" fill="#43A047" />
      </>
    ),
  },
  {
    id: "food-basil",
    label: "בזיל",
    category: "food",
    art: (
      <>
        {bg("#DAF2E2")}
        <path d="M40 14 C59 25 61 50 40 66 C19 50 21 25 40 14 Z" fill="#2E9E5B" />
        <path d="M40 20 V62" stroke="#8FDCAE" strokeWidth="2.5" strokeLinecap="round" />
        <g stroke="#8FDCAE" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M40 32 L31 27" />
          <path d="M40 32 L49 27" />
          <path d="M40 44 L29 38" />
          <path d="M40 44 L51 38" />
        </g>
      </>
    ),
  },
  {
    id: "food-lotus",
    label: "לוטוס",
    category: "food",
    art: (
      <>
        {bg("#FDE4EF")}
        <path d="M14 56 Q40 66 66 56 Q40 50 14 56 Z" fill="#4CAF7A" />
        {[-60, -30, 30, 60].map((a) => (
          <ellipse key={a} cx="40" cy="36" rx="7" ry="17" fill="#F7A1C4" transform={`rotate(${a} 40 54)`} />
        ))}
        <ellipse cx="40" cy="34" rx="8" ry="19" fill="#EE6FA0" />
        <ellipse cx="40" cy="28" rx="3" ry="7" fill="#FBC4DA" />
      </>
    ),
  },
  {
    id: "food-teapot",
    label: "קומקום תה",
    category: "food",
    art: (
      <>
        {bg("#DDF1EF")}
        <path d="M53 43 C62 41 63 33 60 30" stroke="#21867A" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M26 44 L14 34" stroke="#21867A" strokeWidth="5" strokeLinecap="round" />
        <circle cx="40" cy="47" r="17" fill="#2A9D8F" />
        <path d="M26 41 H54" stroke="#FFD166" strokeWidth="3" />
        <ellipse cx="40" cy="30" rx="11" ry="3.5" fill="#21867A" />
        <circle cx="40" cy="25" r="3.5" fill="#FFD166" />
      </>
    ),
  },
  {
    id: "food-fish",
    label: "דג",
    category: "food",
    art: (
      <>
        {bg("#DAEAFB")}
        <path d="M52 40 L66 28 L66 52 Z" fill="#3A7BC8" />
        <ellipse cx="36" cy="40" rx="19" ry="12" fill="#4A90D9" />
        <path d="M30 29 Q36 22 44 29" fill="#3A7BC8" />
        <path d="M40 34 q4 6 0 12" stroke="#A9CDF3" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="25" cy="37" r="3.6" fill="#FFFFFF" />
        <circle cx="24.5" cy="37" r="1.8" fill="#0F2A47" />
      </>
    ),
  },
  {
    id: "food-anise",
    label: "כוכב אניס",
    category: "food",
    art: (
      <>
        {bg("#F4E5D8")}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <g key={a} transform={`rotate(${a} 40 40)`}>
            <ellipse cx="40" cy="25" rx="5.5" ry="12" fill="#8B4A2B" />
            <ellipse cx="40" cy="24" rx="2.2" ry="4" fill="#D9A066" />
          </g>
        ))}
        <circle cx="40" cy="40" r="5" fill="#6E3820" />
      </>
    ),
  },
  {
    id: "food-thai-tea",
    label: "תה תאילנדי",
    category: "food",
    art: (
      <>
        {bg("#FFE6D3")}
        <path d="M44 22 L54 9" stroke="#2EC4B6" strokeWidth="4" strokeLinecap="round" />
        <path d="M25 22 H55 L51 64 H29 Z" fill="#F28C38" />
        <path d="M25 22 H55 L54 32 H26 Z" fill="#FFF3E3" />
        <rect x="31" y="38" width="8" height="8" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
        <rect x="41" y="46" width="7" height="7" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
      </>
    ),
  },
  {
    id: "food-peanut",
    label: "בוטן",
    category: "food",
    art: (
      <>
        {bg("#FBEAD0")}
        <g transform="rotate(-35 40 40)">
          <circle cx="40" cy="28" r="12" fill="#D9A35B" />
          <circle cx="40" cy="51" r="13" fill="#D9A35B" />
          <rect x="31" y="30" width="18" height="18" fill="#D9A35B" />
          <g fill="#B9823E">
            {[
              [36, 24],
              [44, 28],
              [37, 33],
              [43, 41],
              [36, 46],
              [44, 51],
              [38, 56],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
            ))}
          </g>
        </g>
      </>
    ),
  },
];

export const AVATARS: AvatarDef[] = [...FACES, ...FOODS];
export const AVATAR_BY_ID = new Map(AVATARS.map((a) => [a.id, a]));
