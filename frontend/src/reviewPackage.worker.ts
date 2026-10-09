import { captureReviewSource, serializeReviewPackage } from "./reviewPackage";
import type { StoredCase } from "./caseContracts";
import type { StoredComparison } from "./scenarioContracts";

// A dedicated worker owns guard/clone/serialization work. Each request gets one
// worker, so termination also cancels validation without touching saved writes.
self.onmessage = async (event: MessageEvent<{ view: StoredCase; comparison: StoredComparison | null }>) => {
  try {
    const source = captureReviewSource(event.data.view, event.data.comparison);
    const { chunks, size } = await serializeReviewPackage(source.package);
    const buffers = chunks.map(chunk => chunk.buffer as ArrayBuffer);
    self.postMessage({ filename: source.filename, buffers, size }, { transfer: buffers });
  } catch (failure) {
    self.postMessage({ error: failure instanceof Error ? failure.message : "Unable to prepare the original review package." });
  }
};
