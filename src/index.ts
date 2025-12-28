import { parseArgs } from "./cli";
import { render } from "ink";
import React from "react";
import App from "./ui/App";
import { checkOnce } from "./check";
import { toJSON } from "./format";
import { setLocale } from "./presentation/i18n";

async function main() {
  const args = parseArgs(Bun.argv.slice(2));
  setLocale(args.lang);

  if (args.json) {
    const { results } = await checkOnce(
      args.date,
      args.timezone,
      args.timeout,
      args.verbose,
      args.window
    );
    console.log(JSON.stringify(toJSON(results), null, 2));
    return;
  }

  render(React.createElement(App, { args }));
}

await main();
