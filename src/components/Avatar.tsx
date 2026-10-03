import { AVATAR_BY_ID } from "@/avatars/avatars";
import { initialOf } from "@/lib/preferences/model";

export function Avatar({ id, name = "", size = 40, className = "" }: { id: string | null; name?: string; size?: number; className?: string }) {
  const def = id ? AVATAR_BY_ID.get(id) : undefined;
  const style = { width: size, height: size };
  if (def) {
    return (
      <svg className={`avatar ${className}`} style={style} viewBox="0 0 80 80" role="img" aria-label={def.label}>
        {def.art}
      </svg>
    );
  }
  const initial = initialOf(name);
  return (
    <span className={`avatar avatar-fallback ${className}`} style={{ ...style, fontSize: size * 0.45 }} aria-hidden="true">
      {initial || (
        <svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
        </svg>
      )}
    </span>
  );
}
