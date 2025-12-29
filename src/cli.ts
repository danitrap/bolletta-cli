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

function isValidDateFormat(dateStr: string): boolean {
  // Check YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  // Check if it's a valid date
  const date = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateStr;
}

function isValidTimezone(tz: string): boolean {
  try {
    // Test if timezone is valid by attempting to format a date with it
    new Date().toLocaleString('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
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
        const dateValue = String(v);
        if (!isValidDateFormat(dateValue)) {
          console.error(`Error: Invalid date format "${dateValue}". Expected YYYY-MM-DD (e.g., 2025-12-28)`);
          process.exit(1);
        }
        out.date = dateValue;
        if (!a.includes("=")) i++;
        break;
      case "--timezone":
        const tzValue = String(v);
        if (!isValidTimezone(tzValue)) {
          console.error(`Error: Invalid timezone "${tzValue}". Use IANA timezone names (e.g., Europe/Rome, America/New_York)`);
          process.exit(1);
        }
        out.timezone = tzValue;
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
