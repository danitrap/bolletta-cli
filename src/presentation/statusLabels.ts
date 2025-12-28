import type { BetStatus } from "../types";

export function translateMatchStatus(s: string): string {
  switch (s.toUpperCase()) {
    case "SCHEDULED":
    case "TIMED":
      return "Programmata";
    case "IN_PLAY":
    case "LIVE":
      return "In corso";
    case "PAUSED":
      return "Intervallo";
    case "FINISHED":
      return "Finita";
    case "SUSPENDED":
      return "Sospesa";
    case "POSTPONED":
      return "Rinviata";
    case "CANCELLED":
    case "CANCELED":
      return "Annullata";
    case "AWARDED":
      return "Omologata";
    case "ABANDONED":
      return "Abbandonata";
    case "NOT_FOUND":
      return "Non trovata";
    case "ERROR":
      return "Errore";
    default:
      return s;
  }
}

export function translateBetStatus(s: BetStatus): string {
  switch (s) {
    case "WIN":
      return "Vinta";
    case "LOSE":
      return "Persa";
    case "PENDING":
      return "In corso";
    case "NOT_FOUND":
      return "Non trovata";
  }
}

export function translateReason(s: string): string {
  const upper = s.toUpperCase();
  if (upper.startsWith("ERROR")) return "Errore";
  switch (upper) {
    case "FINISHED":
      return "Finita";
    case "NO_SCORE":
      return "Senza risultato";
    case "POSTPONED/CANCELED":
      return "Rinviata/Annullata";
    case "LIVE":
      return "In corso";
    case "NOT_FOUND":
      return "Non trovata";
    default:
      return translateMatchStatus(s);
  }
}
