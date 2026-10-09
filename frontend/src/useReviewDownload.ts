import { useEffect, useRef, useState } from "react";
import type { StoredCase } from "./caseContracts";
import type { StoredComparison } from "./scenarioContracts";
import { MAX_EXPORT_BYTES, reviewFilename } from "./reviewPackage";

type File = { scope: string; url: string; filename: string; size: number };
type Job = { scope: string; worker: Worker };
type Receipt = { filename?: unknown; buffers?: unknown; size?: unknown; error?: unknown };

export function useReviewDownload(scope: string) {
  const currentScope = useRef(scope); currentScope.current = scope;
  const job = useRef<Job | null>(null), resource = useRef<File | null>(null);
  const mounted = useRef(true);
  const [state, setState] = useState<{ scope: string; busy: boolean; error: string; file: File | null }>({ scope, busy: false, error: "", file: null });
  function release(expected?: string) {
    if (job.current && (expected === undefined || job.current.scope === expected)) {
      job.current.worker.terminate(); job.current = null;
    }
    if (resource.current && (expected === undefined || resource.current.scope === expected)) {
      URL.revokeObjectURL(resource.current.url); resource.current = null;
    }
  }
  useEffect(() => () => release(scope), [scope]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; release(); }; }, []);

  function prepare(view: StoredCase, comparison: StoredComparison | null) {
    if (job.current?.scope === scope) return;
    release();
    setState({ scope, busy: true, error: "", file: null });
    let active: Job;
    const expectedFilename = reviewFilename(view.snapshot, comparison?.record ?? null);
    function isCurrent() { return mounted.current && currentScope.current === scope && job.current === active; }
    function fail(message: string) {
      if (!isCurrent()) return;
      active.worker.terminate(); job.current = null;
      setState({ scope, busy: false, error: message, file: null });
    }
    try {
      active = { scope, worker: new Worker(new URL("./reviewPackage.worker.ts", import.meta.url), { type: "module" }) };
      job.current = active;
      active.worker.onmessage = (event: MessageEvent<unknown>) => {
        if (!isCurrent()) return;
        if (!event.data || typeof event.data !== "object" || Array.isArray(event.data)) {
          fail("Export preparation returned an invalid file. No download was offered."); return;
        }
        const result = event.data as Receipt;
        if ("error" in result) { fail(typeof result.error === "string" ? result.error : "Export preparation returned an invalid file. No download was offered."); return; }
        if (result.filename !== expectedFilename || typeof result.size !== "number" || !Number.isSafeInteger(result.size) || result.size < 1 || result.size > MAX_EXPORT_BYTES ||
          !Array.isArray(result.buffers) || !result.buffers.every(v => v instanceof ArrayBuffer) ||
          result.buffers.reduce((sum, v) => sum + v.byteLength, 0) !== result.size) {
          fail("Export preparation returned an invalid file. No download was offered."); return;
        }
        try {
          const url = URL.createObjectURL(new Blob(result.buffers, { type: "application/json;charset=utf-8" }));
          const file = { scope, url, filename: result.filename, size: result.size };
          resource.current = file;
          active.worker.terminate(); job.current = null;
          setState({ scope, busy: false, error: "", file });
          // Keep the same URL for the visible fallback link until superseded or closed.
          const link = document.createElement("a");
          link.href = url; link.download = file.filename;
          document.body.appendChild(link); link.click(); link.remove();
        } catch {
          release();
          setState({ scope, busy: false, error: "The browser could not offer the prepared file. Try an explicit download again.", file: null });
        }
      };
      active.worker.onerror = event => { event.preventDefault(); fail("The browser could not prepare this review package. No file was offered."); };
      active.worker.onmessageerror = event => { event.preventDefault(); fail("Export preparation returned an invalid file. No download was offered."); };
      active.worker.postMessage({ view: { snapshot: view.snapshot, etag: view.etag }, comparison: comparison ? { record: comparison.record, etag: comparison.etag } : null });
    } catch {
      release();
      setState({ scope, busy: false, error: "The browser could not start export preparation. No file was offered.", file: null });
    }
  }
  const current = state.scope === scope ? state : { busy: false, error: "", file: null };
  return { ...current, prepare };
}
