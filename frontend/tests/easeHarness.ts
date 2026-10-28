import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, type Locator, type Page } from "@playwright/test";

/** Ease-of-use task measurement. Specs act only through `TaskMeter`, so every click, key and
 * submit counts as a step and every field filled or chosen counts as an input. Results are
 * written only when EASE_LABEL is set; otherwise the task specs are plain regression tests. */

export const EASE_VIEWPORT = { width: 1440, height: 900 };
export type Host = "standalone" | "streamlit";
export type TaskId = "T1" | "T2" | "T3" | "T4" | "T5" | "T6";

export const ALPINE_EXCEL = fileURLToPath(
  new URL("../src/excel/templates/spreadline-alpine-example-v1.xlsx", import.meta.url),
);
const RAW_DIR = fileURLToPath(new URL("../../ease/data/raw/", import.meta.url));

// The prompt's one exception to accessible-name driving: one query for clickable elements.
const CONTROL_QUERY = "button, a[href], input, select, textarea, [role], [onclick], [tabindex]";

type Segment = { name: string; ms: number; serverMs?: number };

type Ceiling = { steps: number; inputs: number; controls: number; wait: number };
/** Regression ceilings from the Phase 3 "after" measurement (ease/data/metrics-after.json). Steps, inputs and
 * first-screen controls are exact; wait adds 2,500 ms because wall-clock time varies with machine load, which
 * still catches the five-second presentation hold returning on an edit (T3). */
const WAIT_HEADROOM_MS = 2500;
const CEILINGS: Record<Host, Partial<Record<TaskId, Ceiling>>> = {
  standalone: {
    T1: { steps: 2, inputs: 1, controls: 2, wait: 5707 },
    T2: { steps: 0, inputs: 0, controls: 10, wait: 0 },
    T3: { steps: 6, inputs: 2, controls: 10, wait: 184 },
    T4: { steps: 3, inputs: 1, controls: 12, wait: 5411 },
    T5: { steps: 3, inputs: 0, controls: 12, wait: 89 },
    T6: { steps: 4, inputs: 2, controls: 12, wait: 112 },
  },
  streamlit: {
    T1: { steps: 2, inputs: 1, controls: 5, wait: 6614 },
    T2: { steps: 0, inputs: 0, controls: 10, wait: 0 },
    T3: { steps: 6, inputs: 2, controls: 10, wait: 557 },
    T4: { steps: 3, inputs: 1, controls: 12, wait: 5331 },
    T5: { steps: 3, inputs: 0, controls: 12, wait: 292 },
  },
};

export class TaskMeter {
  steps = 0;
  inputs = 0;
  controls: number | null = null;
  primaryActions: number | null = null;
  readonly segments: Segment[] = [];
  readonly figures: Record<string, string> = {};
  readonly notes: Record<string, unknown> = {};
  private last = Date.now();

  constructor(
    readonly page: Page,
    readonly host: Host,
    readonly task: TaskId,
  ) {}

  async click(target: Locator): Promise<void> {
    await target.click();
    this.steps += 1;
    this.last = Date.now();
  }

  async press(target: Locator, key: string): Promise<void> {
    await target.press(key);
    this.steps += 1;
    this.last = Date.now();
  }

  async fill(target: Locator, value: string): Promise<void> {
    await target.fill(value);
    this.inputs += 1;
    this.last = Date.now();
  }

  async choose(target: Locator, value: string): Promise<void> {
    await target.selectOption(value);
    this.inputs += 1;
    this.last = Date.now();
  }

  /** Opening the file chooser is a step; picking the file is an input. */
  async upload(target: Locator, file: string): Promise<void> {
    await target.setInputFiles(file);
    this.steps += 1;
    this.inputs += 1;
    this.last = Date.now();
  }

  /** Records the time from the last action until every locator is visible. When `server` is
   * given, also records when it first appeared (the calculation response, before the hold). */
  async answer(name: string, targets: Locator[], options: { server?: Locator; timeout?: number } = {}): Promise<void> {
    const from = this.last;
    const timeout = options.timeout ?? 30_000;
    const server = options.server
      ?.waitFor({ state: "visible", timeout })
      .then(() => Date.now() - from)
      .catch(() => undefined);
    for (const target of targets) await target.waitFor({ state: "visible", timeout });
    const ms = Date.now() - from;
    this.segments.push({ name, ms, serverMs: server ? await server : undefined });
    this.last = Date.now();
  }

  /** Counts the task's first screen: clickable elements, and `.primary` actions, visible in the viewport. */
  async firstScreen(): Promise<void> {
    const inViewport = (elements: Element[]) =>
      elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= window.innerHeight || rect.left >= window.innerWidth)
          return false;
        return element.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      }).length;
    this.controls = await this.page.locator(CONTROL_QUERY).evaluateAll(inViewport);
    this.primaryActions = await this.page.locator(".primary").evaluateAll(inViewport);
  }

  /** True when the locator's box lies fully inside the viewport without scrolling. */
  async inFirstViewport(target: Locator): Promise<boolean> {
    return target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    });
  }

  figure(key: string, text: string): void {
    this.figures[key] = text.replace(/\s+/g, " ").trim();
  }

  /** Asserts the task's ceilings, then writes its record when EASE_LABEL is set. */
  save(): void {
    const wait = this.segments.reduce((sum, segment) => sum + segment.ms, 0);
    const ceiling = CEILINGS[this.host][this.task];
    if (ceiling) {
      expect(this.steps, `${this.host} ${this.task} steps`).toBeLessThanOrEqual(ceiling.steps);
      expect(this.inputs, `${this.host} ${this.task} inputs`).toBeLessThanOrEqual(ceiling.inputs);
      expect(this.controls ?? 0, `${this.host} ${this.task} first-screen controls`).toBeLessThanOrEqual(ceiling.controls);
      expect(wait, `${this.host} ${this.task} wait (ms)`).toBeLessThanOrEqual(ceiling.wait + WAIT_HEADROOM_MS);
    }
    const label = process.env.EASE_LABEL;
    if (!label) return;
    const run = process.env.EASE_RUN ?? "1";
    const dir = `${RAW_DIR}${label}/`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      `${dir}${this.host}-${this.task}-run${run}.json`,
      `${JSON.stringify(
        {
          host: this.host,
          task: this.task,
          run: Number(run),
          steps: this.steps,
          inputs: this.inputs,
          wait,
          segments: this.segments,
          controls: this.controls,
          primaryActions: this.primaryActions,
          figures: this.figures,
          notes: this.notes,
        },
        null,
        2,
      )}\n`,
    );
  }
}

const SHOTS_DIR = fileURLToPath(new URL("../../ease/shots/", import.meta.url));
const DATA_DIR = fileURLToPath(new URL("../../ease/data/", import.meta.url));

/** Screenshots one inventory screen per call and counts its first-screen controls and primary actions.
 * Probes record what an error or empty state says. Runs only when EASE_CAPTURE is set. */
export class ScreenCapture {
  readonly screens: Record<
    string,
    {
      controls: number;
      primaryActions: number;
      primaryLabels: string[];
      screenPrimary: { scope: "dialog" | "page"; enabled: string[]; disabled: string[] };
    }
  > = {};
  readonly probes: Record<string, string> = {};
  readonly notCaptured: Record<string, string> = {};
  /** Inventory rows that are part of a screen shot under another ID. */
  readonly coveredBy: Record<string, string> = {};
  readonly label = process.env.EASE_LABEL ?? "base";

  cover(ids: string[], shot: string): void {
    for (const id of ids) this.coveredBy[id] = shot;
  }

  constructor(
    readonly page: Page,
    readonly host: Host,
  ) {}

  async shot(id: string, slug: string, options: { fullPage?: boolean } = {}): Promise<void> {
    const dir = `${SHOTS_DIR}${this.label}/${this.host}/`;
    mkdirSync(dir, { recursive: true });
    await this.page.screenshot({ path: `${dir}${id}-${slug}.jpg`, type: "jpeg", quality: 70, fullPage: options.fullPage });
    const meter = new TaskMeter(this.page, this.host, "T1");
    await meter.firstScreen();
    const primaryLabels = await this.page.locator(".primary").evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
        })
        .map((element) => (element as HTMLElement).innerText.replace(/\s+/g, " ").trim()),
    );
    // Done 5 counts per screen, not per viewport: rendered `.primary` actions anywhere on the page, and a
    // modal dialog as its own screen.
    const dialogOpen = (await this.page.locator("dialog[open]").count()) > 0;
    const onScreen = await this.page
      .locator(dialogOpen ? "dialog[open] .primary" : ".primary")
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.checkVisibility())
          .map((element) => ({
            label: (element as HTMLElement).innerText.replace(/\s+/g, " ").trim(),
            disabled: (element as HTMLButtonElement).disabled === true,
          })),
      );
    this.screens[`${id}-${slug}`] = {
      controls: meter.controls ?? 0,
      primaryActions: meter.primaryActions ?? 0,
      primaryLabels,
      screenPrimary: {
        scope: dialogOpen ? "dialog" : "page",
        enabled: onScreen.filter((item) => !item.disabled).map((item) => item.label),
        disabled: onScreen.filter((item) => item.disabled).map((item) => item.label),
      },
    };
  }

  probe(key: string, text: string): void {
    this.probes[key] = text.replace(/\s+/g, " ").trim();
  }

  skip(id: string, reason: string): void {
    this.notCaptured[id] = reason;
  }

  /** Runs one capture; a failure is recorded against the screen instead of ending the sweep. */
  async attempt(id: string, run: () => Promise<void>): Promise<void> {
    try {
      await run();
    } catch (error) {
      this.notCaptured[id] = `failed: ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`;
    }
  }

  save(group: string): void {
    const dir = `${DATA_DIR}capture/${this.label}/`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      `${dir}${this.host}-${group}.json`,
      `${JSON.stringify(
        { screens: this.screens, coveredBy: this.coveredBy, probes: this.probes, notCaptured: this.notCaptured },
        null,
        2,
      )}\n`,
    );
  }
}

/** The decision bar once a final outcome and its reason are both on screen. */
export function decisionReady(page: Page): Locator {
  return page
    .getByRole("region", { name: "Illustrative decision", exact: true })
    // Text filters match concatenated text content ("decisionAPPROVEApprove: …"), so no word boundaries.
    .filter({ hasText: /APPROVE|REVIEW|DECLINE/ })
    .filter({ hasNotText: /CALCULATING|LOADING|SAVING|UNAVAILABLE|Previous result|Preparing the plain-language explanation/ });
}

export function preparationReceived(page: Page): Locator {
  return page
    .getByRole("status", { name: "Assessment preparation", exact: true })
    .getByText(/^Calculation received/);
}

/** Records the outcome and the one-line reason shown in the decision bar. */
export async function recordDecision(meter: TaskMeter, prefix: string): Promise<void> {
  const bar = meter.page.getByRole("region", { name: "Illustrative decision", exact: true });
  meter.figure(`${prefix}.outcome`, await bar.getByText(/^(APPROVE|REVIEW|DECLINE)$/).innerText());
  meter.figure(`${prefix}.reason`, await bar.getByRole("paragraph").first().innerText());
}

const TILE_LABELS = ["Business DSCR", "Global DSCR", "FCCR", "UCA cash flow", "EBITDA", "Annual debt service"];

/** Records each ratio tile's value, status, policy line and cushion. Tiles carry no role or name,
 * so they are read from the named "Assessment overview" region's text, split at the tile labels. */
export async function recordRatioTiles(meter: TaskMeter, prefix: string): Promise<void> {
  const region = meter.page.getByRole("region", { name: "Assessment overview", exact: true });
  const lines = (await region.innerText()).split("\n").map((line) => line.trim()).filter(Boolean);
  for (const label of ["Business DSCR", "Global DSCR", "FCCR"]) {
    const start = lines.indexOf(label);
    if (start < 0) throw new Error(`KPI tile ${label} not found`);
    const end = lines.findIndex((line, index) => index > start && TILE_LABELS.includes(line));
    const tile = lines.slice(start + 1, end < 0 ? undefined : end);
    meter.figure(`${prefix}.${label}.value`, tile.find((line) => /^(-?\d[\d,]*\.\d+x|Not applicable)$/.test(line)) ?? "");
    meter.figure(`${prefix}.${label}.policy`, tile.find((line) => /^Minimum .+, decline below .+$/.test(line)) ?? "");
    meter.figure(
      `${prefix}.${label}.status`,
      tile.find((line) => /^(Meets approval|Review band|Below decline floor|Not applicable)$/.test(line)) ?? "",
    );
    meter.figure(`${prefix}.${label}.cushion`, tile.find((line) => /^(Cushion|No cushion)/.test(line)) ?? "");
  }
}
