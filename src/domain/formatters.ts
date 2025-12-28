export function fmtKickoff(iso: string | undefined, tz: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("it-IT", {
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
