import { mkdirSync, writeFileSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";

/** Friction-pass task meter. Counting rules (fixed before the baseline):
 * - click: each mouse click. Choosing an option in a native select counts 2 clicks (open, choose).
 * - keystroke: each key press, including each character typed; a paste chord counts 1.
 * - screen: each distinct view the task passes through (route-like view, tab, dialog).
 * - scroll: each time a step's target is outside the 1440x900 viewport before the step.
 * - wait: ms from the acting call to the answer being visible.
 * Guesses are judged by hand from the per-step "before" screenshots (run 1 only). */

const ROOT = process.env.FRICTION_OUT ?? new URL("./out", import.meta.url).pathname;
export const LABEL = process.env.FRICTION_LABEL ?? "scratch";
export const RUN = Number(process.env.FRICTION_RUN ?? "1");
export const HOST = (process.env.FRICTION_HOST ?? "standalone") as "standalone" | "streamlit";
export const BASE = HOST === "standalone" ? "http://127.0.0.1:5173/" : "http://127.0.0.1:8501/";
export const TOKEN = "spreadline-playwright-only-credential-20261014";

type Step = { n: number; kind: string; target: string; inViewport: boolean | null; shot?: string };

export class Meter {
  clicks = 0;
  keystrokes = 0;
  scrolls = 0;
  readonly screens: string[] = [];
  readonly steps: Step[] = [];
  readonly waits: { name: string; ms: number }[] = [];
  readonly notes: Record<string, unknown> = {};
  status = "completed";
  private last = Date.now();

  constructor(
    readonly page: Page,
    readonly task: string,
  ) {}

  screen(name: string): void {
    if (!this.screens.includes(name)) this.screens.push(name);
  }

  private async before(kind: string, target: string, locator?: Locator): Promise<Step> {
    let inViewport: boolean | null = null;
    if (locator) {
      inViewport = await locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
      if (!inViewport) this.scrolls += 1;
    }
    const step: Step = { n: this.steps.length + 1, kind, target, inViewport };
    if (RUN === 1) {
      const dir = `${ROOT}/shots/${LABEL}/${HOST}`;
      mkdirSync(dir, { recursive: true });
      const slug = target.replace(/[^A-Za-z0-9]+/g, "-").slice(0, 40);
      step.shot = `${dir}/${this.task}-${String(step.n).padStart(2, "0")}-${kind}-${slug}.jpg`;
      await this.page.screenshot({ path: step.shot, quality: 55 });
    }
    this.steps.push(step);
    return step;
  }

  async click(locator: Locator, target: string): Promise<void> {
    await this.before("click", target, locator);
    await locator.click();
    this.clicks += 1;
    this.last = Date.now();
  }

  async choose(locator: Locator, value: string, target: string): Promise<void> {
    await this.before("choose", target, locator);
    await locator.selectOption(value);
    this.clicks += 2;
    this.last = Date.now();
  }

  /** Types into the focused element; each character is one keystroke. */
  async type(text: string): Promise<void> {
    await this.page.keyboard.insertText(text);
    this.keystrokes += text.length;
    this.last = Date.now();
  }

  async paste(locator: Locator, text: string, target: string): Promise<void> {
    await this.before("paste", target, locator);
    await locator.fill(text);
    this.keystrokes += 1;
    this.last = Date.now();
  }

  async key(key: string, target = key, shot = false): Promise<void> {
    if (shot) await this.before("key", target);
    await this.page.keyboard.press(key);
    this.keystrokes += 1;
    this.last = Date.now();
  }

  /** Label of the focused control, as a user reads it. */
  focused(): Promise<string> {
    return this.page.evaluate(() => {
      let el = document.activeElement as HTMLElement | null;
      while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement;
      if (!el) return "";
      const label = (el as HTMLInputElement).labels?.[0]?.textContent?.trim();
      return label ?? el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
    });
  }

  /** Presses Tab (or Shift+Tab) until the focused control's label starts with `label`; counts every press. */
  async tabTo(label: string, back = false): Promise<number> {
    // Already there (e.g. the app moved focus for the user): no key press.
    if ((await this.focused()).startsWith(label)) return 0;
    for (let i = 1; i <= 80; i++) {
      await this.key(back ? "Shift+Tab" : "Tab");
      if ((await this.focused()).startsWith(label)) return i;
    }
    throw new Error(`Focus never reached "${label}"`);
  }

  async answer(name: string, targets: Locator[], timeout = 30_000): Promise<void> {
    const from = this.last;
    for (const target of targets) await target.first().waitFor({ state: "visible", timeout });
    this.waits.push({ name, ms: Date.now() - from });
    this.last = Date.now();
  }

  /** A reading step: the user must bring `locator` into view to read it. */
  async read(locator: Locator, target: string): Promise<string> {
    const step = await this.before("read", target, locator);
    if (!step.inViewport) await locator.scrollIntoViewIfNeeded();
    return (await locator.innerText()).trim();
  }

  save(): void {
    const dir = `${ROOT}/data/${LABEL}/${HOST}`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      `${dir}/${this.task}-run${RUN}.json`,
      JSON.stringify(
        {
          task: this.task,
          host: HOST,
          run: RUN,
          status: this.status,
          screens: this.screens,
          clicks: this.clicks,
          keystrokes: this.keystrokes,
          scrolls: this.scrolls,
          waitMs: this.waits.reduce((sum, w) => sum + w.ms, 0),
          waits: this.waits,
          steps: this.steps,
          notes: this.notes,
        },
        null,
        2,
      ),
    );
  }
}
