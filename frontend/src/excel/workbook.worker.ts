import { parseWorkbook } from "./workbookReader";

self.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  try {
    const review = await parseWorkbook(new Uint8Array(event.data));
    self.postMessage({ review });
  } catch (reason) {
    self.postMessage({
      error:
        reason instanceof Error
          ? reason.message
          : "The workbook could not be read. Use the Spreadline .xlsx template.",
    });
  }
};
