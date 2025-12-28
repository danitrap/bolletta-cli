import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import type { CliOptions } from "../cli";
import { checkOnce } from "../check";
import { buildTableModel, tableHeaderKeys, type Row } from "../format";
import { t } from "../presentation/i18n";
import { setCycleId, sleep } from "../util/http";

export default function App({ args }: { args: CliOptions }) {
  const { exit } = useApp();
  const [rows, setRows] = useState<Row[]>([]);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(0);
  const refreshNow = React.useRef(false);

  useInput((input, key) => {
    if (input === "q" || key.escape) exit();
    if (input === "r" || key.return) {
      refreshNow.current = true;
      setRemaining(0);
    }
  });

  // spinner while loading
  useEffect(() => {
    if (!loading) return;
    let mounted = true;
    const id = setInterval(() => mounted && setSpin((s) => (s + 1) % 8), 100);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [loading]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        setLoading(true);
        refreshNow.current = false;
        setCycle((c) => {
          const next = c + 1;
          setCycleId(next);
          return next;
        });
        let cycleAllDone = false;
        try {
          const { results, allDone } = await checkOnce(
            args.date,
            args.timezone,
            args.timeout,
            args.verbose,
            args.window
          );
          if (cancelled) return;
          setRows(results);
          setAllDone(allDone);
          cycleAllDone = allDone;
        } catch (e) {
          // keep previous rows, just show status
        } finally {
          setLoading(false);
        }

        if (cancelled) return;
        if (cycleAllDone || args.once) break;

        let r = Math.max(0, Math.floor(args.interval));
        setRemaining(r);
        while (r > 0 && !cancelled && !refreshNow.current) {
          await sleep(1000);
          r -= 1;
          setRemaining(r);
        }
      }
      exit();
    })();
    return () => {
      cancelled = true;
    };
  }, [args, exit]);

  const model = useMemo(() => buildTableModel(rows), [rows]);

  const padRight = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const padCenter = (s: string, w: number) => {
    const total = Math.max(w - s.length, 0);
    const left = Math.floor(total / 2);
    const right = total - left;
    return " ".repeat(left) + s + " ".repeat(right);
  };

  const MAXW: Record<(typeof tableHeaderKeys)[number], number> = {
    MATCH: 28,
    KICKOFF: 32,
    SCORE: 9,
    MATCH_STATUS: 14,
    BET: 16,
    BET_STATUS: 12,
    REASON: 14,
    PROGRESS: 22,
    PROVIDER: 12,
  };
  const MINW: Record<(typeof tableHeaderKeys)[number], number> = {
    MATCH: 16,
    KICKOFF: 20,
    SCORE: 5,
    MATCH_STATUS: 10,
    BET: 8,
    BET_STATUS: 7,
    REASON: 10,
    PROGRESS: 12,
    PROVIDER: 8,
  };

  const ALIGN: Record<(typeof tableHeaderKeys)[number], "left" | "center"> = {
    MATCH: "left",
    KICKOFF: "center",
    SCORE: "center",
    MATCH_STATUS: "center",
    BET: "left",
    BET_STATUS: "center",
    REASON: "left",
    PROGRESS: "left",
    PROVIDER: "left",
  };

  const [termCols, setTermCols] = useState<number>(typeof process !== 'undefined' && (process.stdout as any)?.columns || 80);
  useEffect(() => {
    const onResize = () => {
      setTermCols(((process.stdout as any)?.columns) || 80);
      try {
        // Clear screen and move cursor to home to avoid residual lines after resize
        (process.stdout as any)?.write?.("\x1b[2J\x1b[H");
      } catch {}
    };
    (process.stdout as any)?.on?.('resize', onResize);
    return () => (process.stdout as any)?.off?.('resize', onResize);
  }, []);

  const widths = useMemo(() => {
    const base = model.headers.map((h) => Math.max(Math.min(h.width, MAXW[h.key]), MINW[h.key]));
    const cols = model.headers.length;
    // account for vertical borders: one before each column and one at end
    const borderChars = cols + 1;
    const spaceAvailable = Math.max(20, termCols - borderChars);
    let total = base.reduce((a, b) => a + b, 0);
    const addCap = (i: number) => MAXW[model.headers[i].key] - base[i];
    const subCap = (i: number) => base[i] - MINW[model.headers[i].key];

    // expand if there is spare room: prefer KICKOFF, then MATCH, then PROGRESS
    if (total < spaceAvailable) {
      let extra = spaceAvailable - total;
      const orderIncKeys: Array<(typeof tableHeaderKeys)[number]> = ["KICKOFF", "MATCH", "PROGRESS"];
      while (extra > 0) {
        let progressed = false;
        for (const k of orderIncKeys) {
          const i = model.headers.findIndex((h) => h.key === k);
          if (i === -1) continue;
          const cap = addCap(i);
          if (cap > 0) {
            const take = Math.min(cap, extra);
            base[i] += take;
            extra -= take;
            progressed = true;
            if (extra <= 0) break;
          }
        }
        if (!progressed) break; // nothing more to add
      }
      total = base.reduce((a, b) => a + b, 0);
    }

    // shrink if overflow: reduce less important columns first
    if (total > spaceAvailable) {
      let over = total - spaceAvailable;
      const orderDecKeys: Array<(typeof tableHeaderKeys)[number]> = [
        "PROVIDER",
        "REASON",
        "BET",
        "PROGRESS",
        "MATCH_STATUS",
        "BET_STATUS",
        "MATCH",
      ];
      while (over > 0) {
        let progressed = false;
        for (const k of orderDecKeys) {
          const i = model.headers.findIndex((h) => h.key === k);
          if (i === -1) continue;
          const cap = subCap(i);
          if (cap > 0) {
            const take = Math.min(cap, over);
            base[i] -= take;
            over -= take;
            progressed = true;
            if (over <= 0) break;
          }
        }
        if (!progressed) break; // can't shrink further
      }
    }
    return base;
  }, [model.headers, termCols]);

  // total visible width of the table (content + vertical borders)
  const totalTableWidth = useMemo(
    () => widths.reduce((a, b) => a + b, 0) + (model.headers.length + 1),
    [widths, model.headers.length]
  );
  // pad end-of-line to avoid leftover characters after terminal resize
  const padEOL = () => " ".repeat(Math.max(0, termCols - totalTableWidth));

  const border = (left: string, mid: string, right: string, fill: string) => {
    const segs = widths.map((w) => fill.repeat(w));
    return `${left}${segs.join(mid)}${right}`;
  };

  function colorFor(key: (typeof tableHeaderKeys)[number], r: Row): Parameters<typeof Text>[0]["color"] | undefined {
    if (key === "BET_STATUS") {
      switch (r.BET_STATUS) {
        case "WIN":
          return "green";
        case "LOSE":
          return "red";
        case "PENDING":
          return "yellow";
        case "NOT_FOUND":
          return "gray";
      }
    }
    if (key === "PROGRESS") {
      // color by message
      // compute like format.computeProgress but we only check substrings
      // (the string is already built in model)
      return undefined; // neutral; text reads fine
    }
    if (key === "MATCH_STATUS") {
      const s = r.MATCH_STATUS.toUpperCase();
      if (s.includes("LIVE") || s.includes("IN_PLAY")) return "cyan";
      if (s.includes("FINISHED") || s.includes("AWARDED")) return "green";
      if (s.includes("SCHEDULED") || s.includes("TIMED")) return "blue";
      if (s.includes("POSTPONED")) return "yellow";
      if (s.includes("CANCEL")) return "red";
      if (s.includes("SUSPENDED") || s.includes("ABANDONED")) return "magenta";
      if (s.includes("NOT_FOUND")) return "gray";
    }
    return undefined;
  }

  const title = t("app.title");
  const cycleLabel = t("app.cycle");
  const refreshHint = t("app.refreshHint");
  const loadingText = t("app.loading");
  const completedText = t("app.completed");
  const doneText = t("app.done");
  const quitText = t("app.quit");
  const refreshText = t("app.refresh");
  const updatingText = t("app.updating");
  const nextRefreshText = t("app.nextRefresh", { seconds: remaining });
  const groupOther = t("group.other");
  const spinnerChar = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧"][spin];
  const statusIcon = loading ? spinnerChar : "✔";
  const headerPlain = `${title} · ${statusIcon} ${cycleLabel} #${cycle} · ${refreshHint}`;
  const headerPadding = " ".repeat(Math.max(0, termCols - headerPlain.length));

  return (
    <Box flexDirection="column">
      <Box>
        <Text wrap="truncate-end">
          <Text color="cyanBright">{title}</Text>
          <Text> · </Text>
          <Text>
            {loading ? (
              <Text color="magenta">{spinnerChar}</Text>
            ) : (
              <Text color="green">✔</Text>
            )}
            {" "}{cycleLabel} #{cycle}
          </Text>
          <Text> · </Text>
          <Text dimColor>{refreshHint}</Text>
          {headerPadding}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {rows.length === 0 && loading ? (
          <Text dimColor>{loadingText}</Text>
        ) : (
          <>
            {/* Top border */}
            <Text wrap="truncate-end" dimColor color="gray">{border("┌", "┬", "┐", "─")}{padEOL()}</Text>
            {/* Header row */}
            <Text wrap="truncate-end">
              {model.headers.map((h, i) => (
                <React.Fragment key={`hdr-${h.key}-${i}`}>
                  {i === 0 ? <Text dimColor color="gray">│</Text> : null}
                  <Text bold color="cyanBright">
                    {ALIGN[h.key] === "center"
                      ? padCenter(h.label, widths[i])
                      : padRight(h.label, widths[i])}
                  </Text>
                  <Text dimColor color="gray">│</Text>
                </React.Fragment>
              ))}
              {padEOL()}
            </Text>
            {/* Header separator */}
            <Text wrap="truncate-end" dimColor color="gray">{border("├", "┼", "┤", "─")}{padEOL()}</Text>
            {/* Body grouped by competition */}
            {(() => {
              const groups = new Map<string, number[]>();
              rows.forEach((row, idx) => {
                const g = row.COMPETITION || row.PROVIDER || groupOther;
                if (!groups.has(g)) groups.set(g, []);
                groups.get(g)!.push(idx);
              });
              const entries = Array.from(groups.entries());
              return entries.map(([g, idxs], gi) => (
                <Box key={g} flexDirection="column">
                  {/* Group header as a full-width row constrained to first column */}
                  <Text wrap="truncate-end">
                    {model.headers.map((h, ci) => (
                      <React.Fragment key={`gh-${g}-${ci}`}>
                        {ci === 0 ? <Text color="gray" dimColor>│</Text> : null}
                        {ci === 0 ? (
                          <Text color="white" bold>
                            {padRight((`▸ ${g}`).length > widths[0] ? (`▸ ${g}`).slice(0, Math.max(0, widths[0] - 1)) + "…" : `▸ ${g}`, widths[0])}
                          </Text>
                        ) : (
                          <Text>{padRight("", widths[ci])}</Text>
                        )}
                        <Text color="gray" dimColor>│</Text>
                      </React.Fragment>
                    ))}
                    {padEOL()}
                  </Text>
                  {idxs.map((ri, rpos) => (
                    <Text wrap="truncate-end" key={`${g}-${rpos}`}>
                      {model.headers.map((h, ci) => (
                        <React.Fragment key={`cell-${g}-${ri}-${ci}`}>
                          {ci === 0 ? <Text color="gray" dimColor>│</Text> : null}
                          <Text color={colorFor(h.key, rows[ri])}>
                            {(() => {
                              const raw = model.rows[ri][ci];
                              const w = widths[ci];
                              const truncated = raw.length > w ? raw.slice(0, Math.max(0, w - 1)) + "…" : raw;
                              return ALIGN[h.key] === "center"
                                ? padCenter(truncated, w)
                                : padRight(truncated, w);
                            })()}
                          </Text>
                          <Text color="gray" dimColor>│</Text>
                        </React.Fragment>
                      ))}
                      {padEOL()}
                    </Text>
                  ))}
                  {gi < entries.length - 1 ? (
                    <Text wrap="truncate-end" dimColor color="gray">{border("├", "┼", "┤", "─")}{padEOL()}</Text>
                  ) : null}
                </Box>
              ));
            })()}
            {/* Bottom border */}
            <Text wrap="truncate-end" dimColor color="gray">{border("└", "┴", "┘", "─")}{padEOL()}</Text>
          </>
        )}
      </Box>
      <Box marginTop={1}>
        <Text wrap="truncate-end" inverse>
          {(() => {
            const total = rows.length;
            const done = rows.filter((r) => ["WIN", "LOSE", "NOT_FOUND"].includes(r.BET_STATUS)).length;
            const msg = allDone
              ? ` ${completedText} • ${done}/${total} ${doneText} • ${quitText} `
              : loading
              ? ` ${updatingText} • ${done}/${total} ${doneText} • ${refreshText} • ${quitText} `
              : ` ${nextRefreshText} • ${done}/${total} ${doneText} • ${refreshText} • ${quitText} `;
            return msg + " ".repeat(Math.max(0, termCols - msg.length));
          })()}
        </Text>
      </Box>
    </Box>
  );
}
