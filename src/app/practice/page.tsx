import { Practice } from "@/components/Practice";
import { MODE_INFO, type Mode } from "@/lib/session";

export const metadata = { title: "תרגול — המחתרת התאילנדית" };

export default async function PracticePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const mode = (sp.mode && sp.mode in MODE_INFO ? sp.mode : "mixed") as Mode;
  // key: סבב חדש בכל ניווט למצב או מנה אחרים
  return <Practice key={`${mode}-${sp.dish ?? ""}`} mode={mode} dishId={sp.dish} />;
}
