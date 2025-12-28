import type { ConfigPick } from "./src/betTypes";

// Modifica liberamente questa lista. Il tipo della chiave `bet`
// è controllato a compile-time (autocompletamento + errori su valori non validi).
const config: ConfigPick[] = [
  { home: "Cremonese", away: "Napoli", bet: "X2Under35" },
  { home: "Sunderland", away: "Leeds", bet: "GG" },
  { home: "Crystal Palace", away: "Tottenham", bet: "12" },
  { home: "Bologna", away: "Sassuolo", bet: "Over25" },
  { home: "Algeria", away: "Burkina Faso", bet: "1" },
  { home: "Atalanta", away: "Inter", bet: "X2" },
  // nuovi esempi
  { home: "Milan", away: "Udinese", bet: "1X" },
  { home: "Genoa", away: "Juventus", bet: "2" },
  { home: "Empoli", away: "Cagliari", bet: "Under25" },
  { home: "Fiorentina", away: "Lazio", bet: "X2Over25" },
];

export default config satisfies ReadonlyArray<ConfigPick>;
