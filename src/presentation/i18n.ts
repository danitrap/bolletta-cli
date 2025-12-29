export type Locale = "it" | "en";

type DictionaryValue = string | { [key: string]: DictionaryValue };
type Dictionary = Record<string, DictionaryValue>;

const translations: Record<Locale, Dictionary> = {
  it: {
    common: {
      and: "e",
    },
    app: {
      title: "Bolletta",
      cycle: "ciclo",
      refreshHint: "premi r per aggiornare",
      loading: "Caricamento…",
      completed: "Completato",
      done: "concluse",
      quit: "q per uscire",
      updating: "Aggiornamento in corso…",
      refresh: "r per aggiornare",
      nextRefresh: "Prossimo refresh tra {seconds}s",
    },
    group: {
      other: "Altro",
    },
    headers: {
      MATCH: "Partita",
      KICKOFF: "Inizio",
      SCORE: "Punteggio",
      MATCH_STATUS: "Stato",
      BET: "Scommessa",
      BET_STATUS: "Esito",
      REASON: "Motivo",
      PROGRESS: "Andamento",
      PROVIDER: "Fonte",
    },
    status: {
      match: {
        scheduled: "Programmata",
        live: "In corso",
        paused: "Intervallo",
        finished: "Finita",
        suspended: "Sospesa",
        postponed: "Rinviata",
        cancelled: "Annullata",
        awarded: "Omologata",
        abandoned: "Abbandonata",
        notFound: "Non trovata",
        error: "Errore",
        unknown: "Sconosciuta",
      },
      bet: {
        win: "Vinta",
        lose: "Persa",
        pending: "In corso",
        notFound: "Non trovata",
      },
    },
    reason: {
      error: "Errore",
      finished: "Finita",
      noScore: "Senza risultato",
      postponedCanceled: "Rinviata/Annullata",
      live: "In corso",
      notFound: "Non trovata",
    },
    progress: {
      win: "Vinta",
      lose: "Persa",
      notFound: "Non trovata",
      error: "Errore: {code}",
      awaitingScore: "In attesa di punteggio",
      winningNow: "Vincente al momento",
      missing: "Manca: {items}",
      missingPlural: "Mancano: {items}",
      missingGoals: "Manca: {count} gol",
      missingGoalsPlural: "Mancano: {count} gol",
      missingTwoGoalsOnePerTeam: "Mancano 2 gol (uno per squadra)",
      missingHomeGoal: "Manca: gol casa",
      missingAwayGoal: "Manca: gol ospiti",
      missingUnlockDraw: "Manca: sblocco pareggio",
      missingHomeLead: "Manca: vantaggio casa",
      missingHomeComeback: "Manca: rimonta casa",
      missingHomeLeadOrDraw: "Manca: pareggio o vantaggio casa",
      missingAwayLeadOrDraw: "Manca: pareggio o vantaggio ospiti",
      missingAwayLead: "Manca: vantaggio ospiti",
      missingAwayComeback: "Manca: rimonta ospiti",
      thresholdExceeded: "Soglia superata",
      inProgress: "In corso",
      parts: {
        x2: "X2",
        under35: "Under 3.5",
        over25: "Over 2.5",
      },
    },
    bets: {
      X2Under35: "X2 + Under 3.5",
      GG: "GG",
      "12": "12",
      Over25: "Over 2.5",
      "1": "1",
      X2: "X2",
      "1X": "1X",
      "2": "2",
      Under25: "Under 2.5",
      X2Over25: "X2 + Over 2.5",
    },
  },
  en: {
    common: {
      and: "and",
    },
    app: {
      title: "Betslip",
      cycle: "cycle",
      refreshHint: "press r to refresh",
      loading: "Loading…",
      completed: "Completed",
      done: "done",
      quit: "q to quit",
      updating: "Refreshing…",
      refresh: "r to refresh",
      nextRefresh: "Next refresh in {seconds}s",
    },
    group: {
      other: "Other",
    },
    headers: {
      MATCH: "Match",
      KICKOFF: "Kickoff",
      SCORE: "Score",
      MATCH_STATUS: "Status",
      BET: "Bet",
      BET_STATUS: "Result",
      REASON: "Reason",
      PROGRESS: "Progress",
      PROVIDER: "Source",
    },
    status: {
      match: {
        scheduled: "Scheduled",
        live: "Live",
        paused: "Half-time",
        finished: "Finished",
        suspended: "Suspended",
        postponed: "Postponed",
        cancelled: "Cancelled",
        awarded: "Awarded",
        abandoned: "Abandoned",
        notFound: "Not found",
        error: "Error",
        unknown: "Unknown",
      },
      bet: {
        win: "Won",
        lose: "Lost",
        pending: "Pending",
        notFound: "Not found",
      },
    },
    reason: {
      error: "Error",
      finished: "Finished",
      noScore: "No score",
      postponedCanceled: "Postponed/Cancelled",
      live: "Live",
      notFound: "Not found",
    },
    progress: {
      win: "Won",
      lose: "Lost",
      notFound: "Not found",
      error: "Error: {code}",
      awaitingScore: "Awaiting score",
      winningNow: "Winning for now",
      missing: "Missing: {items}",
      missingPlural: "Missing: {items}",
      missingGoals: "Missing: {count} goal",
      missingGoalsPlural: "Missing: {count} goals",
      missingTwoGoalsOnePerTeam: "Missing 2 goals (one per team)",
      missingHomeGoal: "Missing: home goal",
      missingAwayGoal: "Missing: away goal",
      missingUnlockDraw: "Missing: draw broken",
      missingHomeLead: "Missing: home lead",
      missingHomeComeback: "Missing: home comeback",
      missingHomeLeadOrDraw: "Missing: draw or home lead",
      missingAwayLeadOrDraw: "Missing: draw or away lead",
      missingAwayLead: "Missing: away lead",
      missingAwayComeback: "Missing: away comeback",
      thresholdExceeded: "Threshold exceeded",
      inProgress: "In progress",
      parts: {
        x2: "X2",
        under35: "Under 3.5",
        over25: "Over 2.5",
      },
    },
    bets: {
      X2Under35: "X2 + Under 3.5",
      GG: "GG",
      "12": "12",
      Over25: "Over 2.5",
      "1": "1",
      X2: "X2",
      "1X": "1X",
      "2": "2",
      Under25: "Under 2.5",
      X2Over25: "X2 + Over 2.5",
    },
  },
};

let currentLocale: Locale = "it";

function normalizeLocale(input?: string): Locale {
  if (!input) return "it";
  const lower = input.toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("it")) return "it";
  return "it";
}

function resolveKey(locale: Locale, key: string): string | undefined {
  const parts = key.split(".");
  let node: string | Dictionary | undefined = translations[locale];
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Dictionary)[part];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars?.[key];
    return value === undefined ? match : String(value);
  });
}

export function setLocale(locale?: string) {
  currentLocale = normalizeLocale(locale);
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, vars?: Record<string, string | number>, locale?: Locale): string {
  const loc = locale ?? currentLocale;
  const value = resolveKey(loc, key);
  return interpolate(value ?? key, vars);
}
