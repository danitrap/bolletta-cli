import { parseArgs } from "./cli";
import { render } from "ink";
import React from "react";
import App from "./ui/App";
import { checkOnce } from "./check";
import { toJSON } from "./format";
import { setLocale } from "./presentation/i18n";

function validateEnvironment(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check Football Data token
  if (!Bun.env.FOOTBALL_DATA_TOKEN) {
    warnings.push("FOOTBALL_DATA_TOKEN not set - will use TheSportsDB as fallback (lower quality)");
  }

  // Validate Football Data competitions if provided
  const comps = Bun.env.FOOTBALL_DATA_COMPETITIONS;
  if (comps) {
    const compIds = comps.split(/[,\s]+/).filter(Boolean);
    const validCompIds = compIds.every((id) => /^\d+$/.test(id));
    if (!validCompIds) {
      console.error("Error: FOOTBALL_DATA_COMPETITIONS must be comma-separated numeric IDs (e.g., '2019,2021')");
      return { valid: false, warnings };
    }
  }

  // Validate TheSportsDB key if provided
  const tsdKey = Bun.env.THESPORTSDB_KEY || Bun.env.TSD_API_KEY;
  if (tsdKey && !/^[a-zA-Z0-9]+$/.test(tsdKey)) {
    console.error("Error: THESPORTSDB_KEY must be alphanumeric");
    return { valid: false, warnings };
  }

  return { valid: true, warnings };
}

async function main() {
  // Validate environment variables
  const { valid, warnings } = validateEnvironment();
  if (!valid) {
    process.exit(1);
  }

  // Show warnings if in verbose mode or if no provider is available
  const args = parseArgs(Bun.argv.slice(2));
  setLocale(args.lang);

  // Show environment warnings if verbose
  if (args.verbose && warnings.length > 0) {
    warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
  }

  if (args.json) {
    const { results } = await checkOnce(
      args.date,
      args.timeout,
      args.verbose,
      args.window
    );
    console.log(JSON.stringify(toJSON(results, args.timezone, args.lang), null, 2));
    return;
  }

  render(React.createElement(App, { args }));
}

await main();
