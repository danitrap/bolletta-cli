export type CliOptions = {
  interval: number; // seconds
  json: boolean;
  once: boolean;
  date: string; // YYYY-MM-DD
  timezone: string;
  timeout: number; // ms
  verbose: boolean;
  window: number; // +/- days around date
  lang: string;
};

function parseNumber(value: string | undefined, fallback: number, min = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, n);
}

export function parseArgs(argv: string[]): CliOptions {
  const out: CliOptions = {
    interval: 60,
    json: false,
    once: false,
    date: new Date().toISOString().slice(0, 10),
    timezone: "Europe/Rome",
    timeout: 10000,
    verbose: false,
    window: 0,
    lang: "it",
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const [k, v] = a.includes("=") ? a.split("=", 2) : [a, argv[i + 1]];
    switch (k) {
      case "--interval":
        out.interval = parseNumber(v, out.interval, 0);
        if (!a.includes("=")) i++;
        break;
      case "--json":
        out.json = true;
        break;
      case "--once":
        out.once = true;
        break;
      case "--date":
        out.date = String(v);
        if (!a.includes("=")) i++;
        break;
      case "--timezone":
        out.timezone = String(v);
        if (!a.includes("=")) i++;
        break;
      case "--timeout":
        out.timeout = parseNumber(v, out.timeout, 0);
        if (!a.includes("=")) i++;
        break;
      case "--verbose":
        out.verbose = true;
        break;
      case "--lang":
        out.lang = String(v);
        if (!a.includes("=")) i++;
        break;
      case "--window":
        out.window = parseNumber(v, out.window, 0);
        if (!a.includes("=")) i++;
        break;
    }
  }
  return out;
}
