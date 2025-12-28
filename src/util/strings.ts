// Simple normalization + Jaro-Winkler similarity

const TEAM_ALIASES: Record<string, string> = {
  // Common aliases / shortenings
  "inter": "inter",
  "internazionale": "inter",
  "tottenham hotspur": "tottenham",
  "leeds united": "leeds",
  "crystal palace": "crystal palace",
  "sunderland": "sunderland",
  "cremonese": "cremonese",
  "napoli": "napoli",
  "bologna": "bologna",
  "sassuolo": "sassuolo",
  "algeria": "algeria",
  "burkina faso": "burkina faso",
  "atalanta": "atalanta",
};

export function normalizeTeamName(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s]/g, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  let t = TEAM_ALIASES[s] ?? s;
  // Strip common suffixes/stopwords that hurt similarity
  t = t
    .replace(/\bfc\b/g, "")
    .replace(/\bcalcio\b/g, "")
    .replace(/\bss\b/g, "")
    .replace(/\bass?\b/g, "")
    .replace(/\bssc\b/g, "")
    .replace(/\bus\b/g, "")
    .replace(/\bac\b/g, "")
    .replace(/\bsc\b/g, "")
    .replace(/\bclub\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}

// Jaro-Winkler similarity (0..1)
export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const matchesA: boolean[] = new Array(a.length).fill(false);
  const matchesB: boolean[] = new Array(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - m);
    const end = Math.min(i + m + 1, b.length);
    for (let j = start; j < end; j++) {
      if (matchesB[j]) continue;
      if (a[i] !== b[j]) continue;
      matchesA[i] = true;
      matchesB[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  const aMatched: string[] = [];
  const bMatched: string[] = [];
  for (let i = 0; i < a.length; i++) if (matchesA[i]) aMatched.push(a[i]);
  for (let j = 0; j < b.length; j++) if (matchesB[j]) bMatched.push(b[j]);

  let transpositions = 0;
  for (let i = 0; i < aMatched.length; i++) if (aMatched[i] !== bMatched[i]) transpositions++;
  transpositions /= 2;

  const jaro =
    (matches / a.length + matches / b.length + (matches - transpositions) / matches) / 3;

  // Winkler adjustment
  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  const jw = jaro + prefix * 0.1 * (1 - jaro);
  return Math.min(1, Math.max(0, jw));
}

export function teamSimilarity(a: string, b: string): number {
  return jaroWinkler(normalizeTeamName(a), normalizeTeamName(b));
}
