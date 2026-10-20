import { Unzip, UnzipInflate, zipSync } from "fflate";
import readExcel from "read-excel-file/universal";
import {
  columnName,
  createReview,
  type WorkbookReview,
  type WorkbookSheet,
} from "./workbookModel";
import { workbookSheets } from "./workbookFields";
import { compareDecimal } from "../decimal";
import { parseField } from "../formContracts";

export const MAX_WORKBOOK_BYTES = 2_000_000;
const EXPANDED_LIMIT = 8_000_000,
  ENTRY_LIMIT = 128,
  PART_LIMIT = 2_000_000;
type Entry = {
  size: number;
  compressed: number;
  checksum: number;
  method: number;
  offset: number;
};
const decoder = new TextDecoder("utf-8", { fatal: true });
function fail(
  message = "The Excel archive is malformed. Save a fresh .xlsx copy using the template.",
): never {
  throw new Error(message);
}
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function directory(bytes: Uint8Array): Map<string, Entry> {
  if (bytes.length > MAX_WORKBOOK_BYTES)
    fail("Use an .xlsx file no larger than 2 MB (2,000,000 bytes).");
  if (bytes.length < 22) fail("Use a standard Excel .xlsx archive.");
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (v.getUint32(0, true) !== 0x04034b50)
    fail(
      "Use a standard Excel .xlsx file. Legacy .xls and encrypted files are not supported.",
    );
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (
      v.getUint32(i, true) === 0x06054b50 &&
      i + 22 + v.getUint16(i + 20, true) === bytes.length
    ) {
      end = i;
      break;
    }
  if (end < 0) fail();
  const count = v.getUint16(end + 10, true),
    size = v.getUint32(end + 12, true),
    offset = v.getUint32(end + 16, true);
  if (count === 65535 || size === 0xffffffff || offset === 0xffffffff)
    fail("ZIP64 archives are unsupported. Save a small template workbook.");
  if (
    v.getUint16(end + 4, true) ||
    v.getUint16(end + 6, true) ||
    v.getUint16(end + 8, true) !== count ||
    count < 1 ||
    count > ENTRY_LIMIT ||
    offset + size !== end
  )
    fail(
      "The Excel archive exceeds the entry limit or has an invalid directory.",
    );
  const entries = new Map<string, Entry>();
  let cursor = offset,
    total = 0;
  const regions: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > end || v.getUint32(cursor, true) !== 0x02014b50) fail();
    const flags = v.getUint16(cursor + 8, true),
      method = v.getUint16(cursor + 10, true),
      compressed = v.getUint32(cursor + 20, true),
      expanded = v.getUint32(cursor + 24, true),
      nameSize = v.getUint16(cursor + 28, true),
      extra = v.getUint16(cursor + 30, true),
      comment = v.getUint16(cursor + 32, true),
      local = v.getUint32(cursor + 42, true);
    if (
      compressed === 0xffffffff ||
      expanded === 0xffffffff ||
      local === 0xffffffff
    )
      fail("ZIP64 archives are unsupported.");
    if (flags & 1)
      fail(
        "Encrypted workbooks are unsupported. Save an unencrypted template copy.",
      );
    if (
      ![0, 8].includes(method) ||
      cursor + 46 + nameSize + extra + comment > end ||
      local + 30 > offset
    )
      fail();
    const name = decoder.decode(
      bytes.subarray(cursor + 46, cursor + 46 + nameSize),
    );
    if (
      !name ||
      /[\\:\x00]/.test(name) ||
      name.startsWith("/") ||
      name
        .split("/")
        .some((p) =>
          ["..", ".", "__proto__", "constructor", "prototype"].includes(p),
        ) ||
      name.includes("//") ||
      entries.has(name)
    )
      fail("The Excel archive contains a duplicate or invalid part path.");
    if (/vbaProject|externalLinks|embeddings|activeX|\.bin$/i.test(name))
      fail(
        "Remove macros, external workbook links and embedded objects, then save as .xlsx.",
      );
    total += expanded;
    if (expanded > PART_LIMIT || total > EXPANDED_LIMIT)
      fail(
        "The expanded workbook is too large. Use the small intake template.",
      );
    if (
      v.getUint32(local, true) !== 0x04034b50 ||
      v.getUint16(local + 6, true) !== flags ||
      v.getUint16(local + 8, true) !== method
    )
      fail("The Excel archive has inconsistent or encrypted headers.");
    const localName = v.getUint16(local + 26, true),
      localExtra = v.getUint16(local + 28, true),
      dataStart = local + 30 + localName + localExtra;
    if (
      dataStart + compressed > offset ||
      decoder.decode(bytes.subarray(local + 30, local + 30 + localName)) !==
        name
    )
      fail();
    if (
      !(flags & 8) &&
      (v.getUint32(local + 18, true) !== compressed ||
        v.getUint32(local + 22, true) !== expanded)
    )
      fail();
    regions.push([local, dataStart + compressed]);
    entries.set(name, {
      size: expanded,
      compressed,
      checksum: v.getUint32(cursor + 16, true),
      method,
      offset: local,
    });
    cursor += 46 + nameSize + extra + comment;
  }
  regions.sort((a, b) => a[0] - b[0]);
  if (
    cursor !== end ||
    regions.some((r, i) => i > 0 && r[0] < regions[i - 1][1])
  )
    fail();
  if (!entries.has("xl/workbook.xml") || !entries.has("[Content_Types].xml"))
    fail("The archive is not a supported Excel workbook.");
  return entries;
}
function expand(
  bytes: Uint8Array,
  entries: Map<string, Entry>,
): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = Object.create(null);
  let total = 0;
  const seen = new Set<string>();
  const unzip = new Unzip((file) => {
    const entry = entries.get(file.name);
    if (!entry || seen.has(file.name) || entry.method !== file.compression)
      fail();
    seen.add(file.name);
    const chunks: Uint8Array[] = [];
    let size = 0,
      crc = 0xffffffff,
      callbackFailure: Error | null = null;
    const rejectFile = (message: string): never => {
      callbackFailure = new Error(message);
      file.terminate();
      throw callbackFailure;
    };
    file.ondata = (error, chunk, final) => {
      if (error) {
        if (callbackFailure) throw callbackFailure;
        fail("The Excel archive could not be decompressed. Save a fresh copy.");
      }
      size += chunk.length;
      total += chunk.length;
      if (size > entry.size || size > PART_LIMIT || total > EXPANDED_LIMIT)
        rejectFile("The actual expanded workbook exceeds the size limit.");
      for (const byte of chunk)
        crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
      chunks.push(chunk);
      if (final) {
        if (size !== entry.size || (crc ^ 0xffffffff) >>> 0 !== entry.checksum)
          rejectFile(
            "The Excel archive checksum or expanded size is invalid. Save a fresh copy.",
          );
        const output = new Uint8Array(size);
        let at = 0;
        for (const part of chunks) {
          output.set(part, at);
          at += part.length;
        }
        files[file.name] = output;
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  for (let i = 0; i < bytes.length; i += 1024)
    unzip.push(bytes.subarray(i, i + 1024), i + 1024 >= bytes.length);
  if (seen.size !== entries.size || Object.keys(files).length !== entries.size)
    fail();
  return files;
}
const xmlPrefix = String.raw`(?:[^\s<>/:]+:)?`;
const xmlAttributes = String.raw`(?:[^"'<>]|"[^"]*"|'[^']*')*`;
function tags(xml: string, name: string) {
  return xml.matchAll(
    new RegExp(`<${xmlPrefix}${name}(?=[\\s/>])${xmlAttributes}>`, "g"),
  );
}
function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = Object.create(null);
  for (const match of tag.matchAll(/([^\s<>=/"']+)\s*=\s*(["'])(.*?)\2/gs)) {
    if (Object.prototype.hasOwnProperty.call(result, match[1]))
      fail("Duplicate XML attributes are unsupported.");
    result[match[1]] = match[3].replace(
      /&#(x[\da-f]+|\d+);|&(amp|quot|apos|lt|gt);/gi,
      (_, n: string, named: string) =>
        n
          ? String.fromCodePoint(Number(n.startsWith("x") ? "0" + n : n))
          : { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" }[
              named.toLowerCase()
            ]!,
    );
  }
  return result;
}
function coordinate(value: string): void {
  const match = /^([A-Z]{1,3})([1-9]\d{0,6})$/.exec(value);
  if (!match) fail("Invalid worksheet cell coordinates.");
  let column = 0;
  for (const c of match[1]) column = column * 26 + c.charCodeAt(0) - 64;
  if (column > 128 || Number(match[2]) > 256)
    fail("Worksheet dimensions exceed the template limit.");
}
type DateSources = {
  epoch1904: boolean;
  sheets: Map<string, Map<string, { type?: string; value: string }>>;
};
function inspectXml(files: Record<string, Uint8Array>): DateSources {
  let cells = 0;
  const decoded = new Map<string, string>();
  for (const [name, bytes] of Object.entries(files))
    if (/\.xml$|\.rels$/i.test(name)) {
      const xml = decoder.decode(bytes).replace(/<!--[\s\S]*?-->/g, "");
      decoded.set(name, xml);
      if (/<!DOCTYPE|<!ENTITY/i.test(xml))
        fail(
          "XML document types and entities are unsupported in the intake template.",
        );
      if (/<!\[CDATA\[/.test(xml))
        fail(
          "Save a fresh .xlsx copy of the Spreadline template using standard Excel values.",
        );
      if (
        /macroEnabled|vbaProject|oleObject|activeX/i.test(xml) &&
        name === "[Content_Types].xml"
      )
        fail("Use a macro-free .xlsx template workbook.");
      if (name.endsWith(".rels")) {
        const ids = new Set<string>();
        for (const tag of tags(xml, "Relationship")) {
          const a = attributes(tag[0]);
          if (ids.has(a.Id))
            fail(
              "Duplicate workbook relationship identifiers are unsupported.",
            );
          ids.add(a.Id);
          if (
            a.TargetMode?.toLowerCase() === "external" ||
            /^[a-z]+:/i.test(a.Target ?? "")
          )
            fail("Remove external workbook links before importing.");
        }
      }
      if (/^xl\/worksheets\/[^/]+\.xml$/.test(name)) {
        if (!tags(xml, "f").next().done)
          fail(
            "Formulas are unsupported, including cached results. Copy and paste values before importing.",
          );
        for (const tag of tags(xml, "dimension"))
          for (const point of (attributes(tag[0]).ref ?? "").split(":"))
            coordinate(point);
        for (const tag of tags(xml, "row")) {
          const a = attributes(tag[0]);
          if (a.r !== undefined) coordinate("A" + a.r);
        }
        for (const tag of tags(xml, "col")) {
          const a = attributes(tag[0]);
          if (
            !/^\d+$/.test(a.min ?? "") ||
            !/^\d+$/.test(a.max ?? "") ||
            Number(a.min) < 1 ||
            Number(a.max) > 128
          )
            fail("Worksheet column dimensions exceed the template limit.");
        }
        const seen = new Set<string>();
        for (const tag of tags(xml, "c")) {
          const a = attributes(tag[0]);
          coordinate(a.r ?? "");
          if (seen.has(a.r))
            fail("Duplicate worksheet cell coordinates are unsupported.");
          seen.add(a.r);
          if (++cells > 5000)
            fail("The workbook exceeds the 5,000-cell limit.");
          if (a.t === "e")
            fail(
              "An Excel cell contains an error. Replace errors with reviewed values.",
            );
        }
      }
    }
  const workbook = decoded.get("xl/workbook.xml")!;
  const sheetTags = [...tags(workbook, "sheet")];
  const names = sheetTags.map((tag) => attributes(tag[0]).name);
  if (
    names.length !== 5 ||
    new Set(names).size !== 5 ||
    names.some((name) => !workbookSheets.some((s) => s.name === name))
  )
    fail(
      "Use the five sheets in the Spreadline template without renaming them.",
    );
  if (
    sheetTags.some((tag) =>
      ["hidden", "veryHidden"].includes(attributes(tag[0]).state),
    )
  )
    fail("Unhide the five template sheets before importing.");
  const rels = new Map(
    [
      ...tags(decoded.get("xl/_rels/workbook.xml.rels") ?? "", "Relationship"),
    ].map((tag) => {
      const a = attributes(tag[0]);
      return [a.Id, a.Target] as const;
    }),
  );
  const paths = sheetTags.map((tag) => {
    const a = attributes(tag[0]),
      ids = Object.entries(a).filter(([key]) => key.endsWith(":id"));
    if (ids.length !== 1)
      fail("The template's worksheet relationship is invalid.");
    const target = rels.get(ids[0][1]) ?? "";
    return target.startsWith("/") ? target.slice(1) : "xl/" + target;
  });
  if (
    new Set(paths).size !== 5 ||
    paths.some(
      (path) =>
        !/^xl\/worksheets\/[^/]+\.xml$/.test(path) || !decoded.has(path),
    )
  )
    fail("Use five distinct worksheets from the Spreadline template.");
  const dateTag = tags(workbook, "workbookPr").next().value?.[0] ?? "",
    dateSetting = attributes(dateTag).date1904;
  if (
    dateSetting !== undefined &&
    !["0", "1", "true", "false"].includes(dateSetting)
  )
    fail("The workbook date system is invalid. Save a fresh template copy.");
  const sheets: DateSources["sheets"] = new Map();
  paths.forEach((path, index) => {
    const source = new Map<string, { type?: string; value: string }>();
    for (const tag of decoded.get(path)!.matchAll(
      new RegExp(
        `<${xmlPrefix}c(?=[\\s/>])${xmlAttributes}(?<!/)>([\\s\\S]*?)<\\/${xmlPrefix}c>`,
        "g",
      ),
    )) {
      const opening = tags(tag[0], "c").next().value![0],
        a = attributes(opening),
        value = tag[1].match(
          new RegExp(`<${xmlPrefix}v(?=[\\s>])${xmlAttributes}>([^<]*)<\\/`),
        )?.[1];
      if (value !== undefined) source.set(a.r, { type: a.t, value });
    }
    sheets.set(names[index], source);
  });
  return { epoch1904: dateSetting === "1" || dateSetting === "true", sheets };
}

/** The reader identifies date styles; original XML values remain authoritative.
 * Reconstruct whole calendar days before its Date conversion can normalize an
 * invalid ISO date, lose a fractional day, or shift January/February 1900. */
function restoreDates(sheets: WorkbookSheet[], sources: DateSources): void {
  for (const sheet of sheets)
    sheet.data.forEach((row, r) =>
      row.forEach((value, c) => {
        if (!(value instanceof Date)) return;
        const cell = `${columnName(c)}${r + 1}`,
          source = sources.sheets.get(sheet.sheet)?.get(cell),
          raw = source?.value.trim() ?? "";
        const message = `${sheet.sheet}!${cell}: use a valid calendar date without a time.`;
        if (source?.type === "d") {
          // Native ISO cells may be dates or midnight timestamps. Reject rollover
          // and timezone/time components instead of silently changing the day.
          const match = /^(\d{4}-\d{2}-\d{2})(?:T00:00(?::00(?:\.0+)?)?(?:Z|[+]00:00)?)?$/.exec(raw);
          if (!match) fail(message);
          try {
            const day = parseField(
              { pointer: "", label: "Date", kind: "date" }, match[1],
            );
            row[c] = new Date(`${day}T00:00:00Z`);
          } catch {
            fail(message);
          }
        } else {
          const serial = Number(raw);
          try {
            if (
              !raw || !Number.isSafeInteger(serial) ||
              compareDecimal(raw, String(serial)) !== 0
            )
              fail(message);
          } catch {
            fail(message);
          }
          if (!sources.epoch1904 && serial === 60)
            fail("Excel's fictitious 1900-02-29 is not a calendar date. Correct the date cell.");
          const epoch = sources.epoch1904
            ? "1904-01-01"
            : serial < 60 ? "1899-12-31" : "1899-12-30";
          const date = new Date(Date.parse(`${epoch}T00:00:00Z`) + serial * 86_400_000);
          if (
            !Number.isFinite(date.getTime()) ||
            date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999
          )
            fail(message);
          row[c] = date;
        }
      }),
    );
}

export async function parseWorkbook(
  bytes: Uint8Array,
): Promise<WorkbookReview> {
  const entries = directory(bytes),
    files = expand(bytes, entries);
  const dateSources = inspectXml(files);
  // Repackage already bounded parts without compression. The general reader only
  // sees a verified archive and never needs nested decompression workers.
  const safe = zipSync(files, { level: 0 });
  let sheets;
  try {
    sheets = await readExcel(safe.buffer as ArrayBuffer, {
      parseNumber: (value) => value,
      trim: false,
    });
  } catch {
    throw new Error(
      "The Excel XML could not be read. Save a fresh .xlsx template copy with values only.",
    );
  }
  restoreDates(sheets, dateSources);
  return createReview(sheets);
}
