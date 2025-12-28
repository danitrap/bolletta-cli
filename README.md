**Bolletta CLI (Bun + Ink + TypeScript)**

- Controlla periodicamente lo stato delle partite della schedina e valuta gli esiti.
- Resta aperto finché tutte le partite non sono FINISHED oppure NOT_FOUND (o con Ctrl+C).

**Prerequisiti**

- Bun installato.

**Installazione**

- bun install

**Avvio**

- FOOTBALL_DATA_TOKEN=... bun run check
  - Senza token usa TheSportsDB come fallback (qualità variabile).
  - football-data.org richiede un token (header: X-Auth-Token) in `FOOTBALL_DATA_TOKEN`.

**Esempi**

- bun run check --interval 60
- bun run check --once --json

**Comando**

- `bun run check` (entry: `src/index.ts` con UI Ink)

**UI (Ink)**

- Interfaccia TUI reattiva con Ink.
- Mostra tabella risultati e stato di refresh.
- Tasti rapidi: `q` per uscire.

**Opzioni**

- `--interval 60` (secondi, default 60)
- `--json` (output machine readable)
- `--once` (singolo ciclo e termina)
- `--date 2025-12-28` (override data per la ricerca)
- `--timezone Europe/Rome` (default)
- `--timeout 10000` (ms)
- `--verbose`

**Configurazione schedina**

- File: `schedina.config.ts` alla radice del progetto.
- Tipo controllato: ogni voce è `{ home: string; away: string; bet: BetType }` dove `BetType` è una unione di valori ammessi:
  `"X2Under35" | "GG" | "12" | "Over25" | "1" | "X2" | "1X" | "2" | "Under25" | "X2Over25"`.
- Esempio:

```ts
import type { ConfigPick } from "./src/betTypes";

const config: ConfigPick[] = [
  { home: "Cremonese", away: "Napoli", bet: "X2Under35" },
  { home: "Sunderland", away: "Leeds", bet: "GG" },
];

export default config satisfies ReadonlyArray<ConfigPick>;
```

- Le etichette e la logica di valutazione sono mappate internamente dal tipo `bet` scelto.

**Output**

- Tabella (UI, italiano): `Partita | Inizio | Punteggio | Stato | Scommessa | Esito | Motivo | Fonte`
- Con `--json` stampa array JSON con chiavi originali inglesi (`MATCH`, `KICKOFF`, `SCORE`, `MATCH_STATUS`, `BET`, `BET_STATUS`, `REASON`, `PROVIDER`).

**Provider**

- Primario: football-data.org (API v4). Token in `FOOTBALL_DATA_TOKEN`.
- Competizioni interrogate (default): CL(2001), BL1(2002), PD(2014), FL1(2015), SA(2019), PL(2021).
- Override competizioni: `FOOTBALL_DATA_COMPETITIONS=2019,2021` (comma-separato).
- Fallback: TheSportsDB (key configurabile, default `123`), solo se il primo fallisce o non trova.
  - Usa `searchevents.php?e=Home_vs_Away&d=YYYY-MM-DD` come da docs.

**Endpoint Rapidi**

- football-data (v4):
  - Header: `X-Auth-Token: $FOOTBALL_DATA_TOKEN`
  - Matches per competizione e data: `/v4/competitions/{id}/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`
  - Esempio: `https://api.football-data.org/v4/competitions/2019/matches?dateFrom=2025-12-28&dateTo=2025-12-28`
  - Env opzionale: `FOOTBALL_DATA_COMPETITIONS=2019,2021` per scegliere le competizioni interrogate.

- TheSportsDB (v1):
  - Chiave: `THESPORTSDB_KEY` (default `123` se non presente).
  - Ricerca evento: `/api/v1/json/{key}/searchevents.php?e=Home_vs_Away&d=YYYY-MM-DD`
  - Dettaglio evento: `/api/v1/json/{key}/lookupevent.php?id={idEvent}`
  - Esempio: `https://www.thesportsdb.com/api/v1/json/123/searchevents.php?e=Sunderland_AFC_vs_Leeds_United_FC&d=2025-12-28`
  - Variabile: `THESPORTSDB_KEY` (o `TSD_API_KEY`).

**Note tecniche**

- Polling con cache per ciclo per evitare richiami duplicati.
- Timeout e retry con backoff esponenziale su 429/5xx.
- Niente dotenv: Bun carica `.env` automaticamente.
