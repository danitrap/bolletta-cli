function localeFor(lang?: string): string {
  if (!lang) return "it-IT";
  const lower = lang.toLowerCase();
  if (lower.startsWith("en")) return "en-US";
  if (lower.startsWith("it")) return "it-IT";
  return "it-IT";
}

export function fmtKickoff(iso: string | undefined, tz: string, lang?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return fmt.format(d);
}

export function fmtScore(s?: { home: number | null; away: number | null } | null): string {
  if (s && s.home != null && s.away != null) return `${s.home}-${s.away}`;
  return "-";
}
