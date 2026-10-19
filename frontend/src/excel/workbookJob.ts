import WorkbookWorker from "./workbook.worker.ts?worker&inline";
import type { WorkbookReview } from "./workbookModel";

export function readWorkbookFile(
  file: File,
  signal: AbortSignal,
): Promise<WorkbookReview> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Excel import cancelled."));
      return;
    }
    let worker: Worker;
    try {
      worker = new WorkbookWorker();
    } catch {
      reject(
        new Error(
          "The browser could not start Excel import. Try again in a supported browser.",
        ),
      );
      return;
    }
    let finished = false;
    const stop = () => {
      finished = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      worker.terminate();
    };
    const fail = (message: string) => {
      if (finished) return;
      stop();
      reject(new Error(message));
    };
    const abort = () => fail("Excel import cancelled.");
    const timer = setTimeout(
      () =>
        fail(
          "Excel import exceeded its five-second limit. Use a smaller template workbook.",
        ),
      5000,
    );
    signal.addEventListener("abort", abort, { once: true });
    worker.onerror = (event) => {
      event.preventDefault();
      fail("Excel import failed. Save a fresh .xlsx copy of the template.");
    };
    worker.onmessageerror = () =>
      fail(
        "Excel import returned an unreadable result. Select the workbook again.",
      );
    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (finished) return;
      const data = event.data;
      if (!data || typeof data !== "object") {
        fail("Excel import returned an invalid result.");
        return;
      }
      if ("error" in data) {
        fail(
          typeof data.error === "string" ? data.error : "Excel import failed.",
        );
        return;
      }
      const review = "review" in data ? data.review : null;
      if (
        !review ||
        typeof review !== "object" ||
        !("fields" in review) ||
        !Array.isArray(review.fields) ||
        !review.fields.length ||
        review.fields.length > 5000 ||
        !review.fields.every(
          (f) =>
            f &&
            typeof f.pointer === "string" &&
            typeof f.value === "string" &&
            f.value.length <= 2000 &&
            typeof f.sheet === "string" &&
            typeof f.cell === "string",
        )
      ) {
        fail(
          "Excel import returned invalid fields. Select a template workbook again.",
        );
        return;
      }
      stop();
      resolve(review as WorkbookReview);
    };
    void file
      .arrayBuffer()
      .then((bytes) => {
        if (!finished) worker.postMessage(bytes, [bytes]);
      })
      .catch(() =>
        fail("The browser could not read this file. Select it again."),
      );
  });
}
