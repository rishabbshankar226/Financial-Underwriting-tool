import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { zipSync, unzipSync, strFromU8, strToU8 } from "fflate";
import { parseWorkbook, MAX_WORKBOOK_BYTES } from "../src/excel/workbookReader";
import { validateReview } from "../src/excel/workbookModel";

const example = () =>
  new Uint8Array(
    readFileSync(
      new URL(
        "../src/excel/templates/spreadline-alpine-example-v1.xlsx",
        import.meta.url,
      ),
    ),
  );
const blank = () =>
  new Uint8Array(
    readFileSync(
      new URL(
        "../src/excel/templates/spreadline-intake-template-v1.xlsx",
        import.meta.url,
      ),
    ),
  );
const expected = JSON.parse(
  readFileSync(
    new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url),
    "utf8",
  ),
);
function change(part: string, edit: (xml: string) => string) {
  const parts = unzipSync(example());
  parts[part] = strToU8(edit(strFromU8(parts[part])));
  return zipSync(parts);
}
function cell(
  xml: string,
  address: string,
  type: string,
  value: string,
  formula = "",
) {
  const pattern = new RegExp(
    `<(?:\\w+:)?c\\b[^>]*r="${address}"[^>]*>[\\s\\S]*?<\\/(?:\\w+:)?c>`,
  );
  return xml.replace(pattern, (original) => {
    const tag = original.match(/<((?:\w+:)?c)\b/)![1];
    const prefix = tag.includes(":") ? tag.split(":")[0] + ":" : "";
    const attrs = original
      .slice(original.indexOf(" "), original.indexOf(">"))
      .replace(/\bt="[^"]*"/, `t="${type}"`);
    return `<${tag}${attrs}>${formula ? `<${prefix}f>${formula}</${prefix}f>` : ""}<${prefix}v>${value}</${prefix}v></${tag}>`;
  });
}
test("a real Excel example maps every field to the unchanged dated request", async () => {
  const review = await parseWorkbook(example());
  const result = validateReview(review);
  expect(result.issues).toEqual([]);
  expect(result.input).toEqual(expected);
  expect(
    review.fields.find((f) => f.pointer === "/years/1/gross_receipts")?.cell,
  ).toBe("C10");
});
test("text and numeric XML preserve financial precision beyond JavaScript numbers", async () => {
  for (const type of ["str", "n"]) {
    const review = await parseWorkbook(
      change("xl/worksheets/sheet2.xml", (xml) =>
        cell(xml, "C10", type, "10000000000000000.01"),
      ),
    );
    expect(validateReview(review).input?.years[1].gross_receipts).toBe(
      "10000000000000000.01",
    );
  }
});
test("a blank template stays missing, and empty guarantor columns remain optional", async () => {
  const review = await parseWorkbook(blank());
  const result = validateReview(review);
  expect(result.input).toBeNull();
  expect(
    result.issues.some((i) => i.pointer === "/years/0/gross_receipts"),
  ).toBe(true);
  expect(result.issues.some((i) => i.pointer.startsWith("/guarantors/"))).toBe(
    false,
  );
});
test("review corrections support exact percentages and preserve leading-zero geography and explicit zero", async () => {
  const review = await parseWorkbook(example());
  review.fields = review.fields.map((f) => ({
    ...f,
    value:
      f.pointer === "/proposed_loan/annual_rate"
        ? "10.5%"
        : f.pointer === "/geography"
          ? "00601"
          : f.value,
  }));
  const result = validateReview(review);
  expect(result.issues).toEqual([]);
  expect(result.input?.proposed_loan.annual_rate).toBe("0.105");
  expect(result.input?.geography).toBe("00601");
  expect(result.input?.years[0].section_179).toBe("0");
});
test("invalid months, booleans, rates and excessive precision retain cell-specific issues", async () => {
  const review = await parseWorkbook(example());
  for (const [pointer, value] of [
    ["/proposed_loan/term_months", "12.5"],
    ["/proposed_loan/annual_rate", "101%"],
    ["/years/1/gross_receipts", "1".repeat(35)],
  ]) {
    const result = validateReview({
      ...review,
      fields: review.fields.map((f) =>
        f.pointer === pointer ? { ...f, value } : f,
      ),
    });
    expect(result.input).toBeNull();
    expect(
      result.issues.some((i) => i.pointer === pointer && !!i.cell && !!i.sheet),
    ).toBe(true);
  }
  const boolean = await parseWorkbook(
    change("xl/worksheets/sheet2.xml", (xml) => cell(xml, "C10", "b", "1")),
  );
  expect(
    validateReview(boolean).issues.some(
      (i) => i.pointer === "/years/1/gross_receipts",
    ),
  ).toBe(true);
});
test("fiscal-period and working-capital validation use source cells and preserve the draft", async () => {
  const review = await parseWorkbook(example());
  const altered = {
    ...review,
    fields: review.fields.map((f) =>
      f.pointer === "/working_capital/period_end"
        ? { ...f, value: "2024-12-31" }
        : f,
    ),
  };
  expect(validateReview(altered).issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        pointer: "/working_capital/period_end",
        sheet: "Working capital",
        cell: "B9",
      }),
    ]),
  );
  expect(validateReview(review).input).toEqual(expected);
});
test("formulas are rejected even when their cached financial value looks valid", async () => {
  await expect(
    parseWorkbook(
      change("xl/worksheets/sheet2.xml", (xml) =>
        cell(xml, "C10", "n", "4200000", "SUM(1,2)"),
      ),
    ),
  ).rejects.toThrow(/formula|values/i);
});
test("cached Excel errors and external relationships are refused", async () => {
  await expect(
    parseWorkbook(
      change("xl/worksheets/sheet2.xml", (xml) =>
        cell(xml, "C10", "e", "#DIV/0!"),
      ),
    ),
  ).rejects.toThrow(/error|values/i);
  await expect(
    parseWorkbook(
      change("xl/_rels/workbook.xml.rels", (xml) =>
        xml.replace(
          /<\/[^>]+>\s*$/,
          '<Relationship Id="external" Type="link" Target="https://example.invalid/" TargetMode="&#69;xternal"/></Relationships>',
        ),
      ),
    ),
  ).rejects.toThrow(/external/i);
});
test("native 1904 dates support both XML boolean encodings", async () => {
  for (const setting of ["1", "true"]) {
    const parts = unzipSync(example());
    let xml = strFromU8(parts["xl/workbook.xml"]);
    xml = xml.replace(/<(?:\w+:)?workbookPr\b[^>]*\/>/, "");
    xml = xml.replace(
      /(<(?:\w+:)?workbook\b[^>]*>)/,
      `$1<workbookPr xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" date1904="${setting}"/>`,
    );
    parts["xl/workbook.xml"] = strToU8(xml);
    parts["xl/worksheets/sheet1.xml"] = strToU8(
      cell(strFromU8(parts["xl/worksheets/sheet1.xml"]), "B10", "n", "1"),
    );
    const review = await parseWorkbook(zipSync(parts));
    expect(
      review.fields.find((f) => f.pointer === "/assessment_as_of")?.value,
    ).toBe("1904-01-02");
  }
});
test("Excel's fictitious 1900 leap day is rejected rather than silently moved", async () => {
  await expect(
    parseWorkbook(
      change("xl/worksheets/sheet1.xml", (xml) => cell(xml, "B10", "n", "60")),
    ),
  ).rejects.toThrow(/1900|calendar/i);
});
test("unsupported sheet names and duplicate field labels never silently drop data", async () => {
  const renamed = change("xl/workbook.xml", (xml) =>
    xml.replace('name="Financials"', 'name="Unknown"'),
  );
  await expect(parseWorkbook(renamed)).rejects.toThrow(/sheet|template/i);
  const duplicate = change("xl/worksheets/sheet1.xml", (xml) =>
    xml.replace("Geography", "Borrower name"),
  );
  await expect(parseWorkbook(duplicate)).rejects.toThrow(/duplicate|label/i);
});
test("malformed, encrypted, oversized and ZIP64 archives are bounded before parsing", async () => {
  await expect(parseWorkbook(new Uint8Array([1, 2, 3]))).rejects.toThrow(
    /xlsx|Excel|archive/i,
  );
  await expect(
    parseWorkbook(new Uint8Array(MAX_WORKBOOK_BYTES + 1)),
  ).rejects.toThrow(/size|MB|bytes/i);
  const encrypted = example();
  new DataView(encrypted.buffer).setUint16(6, 1, true);
  await expect(parseWorkbook(encrypted)).rejects.toThrow(/encrypt|archive/i);
  const zip64 = example();
  new DataView(zip64.buffer).setUint16(zip64.length - 12, 65535, true);
  await expect(parseWorkbook(zip64)).rejects.toThrow(/ZIP64|archive/i);
});
test("large worksheet dimensions and declared expansion are refused", async () => {
  await expect(
    parseWorkbook(
      change("xl/worksheets/sheet2.xml", (xml) =>
        xml.replace(
          /(<(?:\w+:)?worksheet\b[^>]*>)/,
          '$1<dimension xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ref="A1:XFD1048576"/>',
        ),
      ),
    ),
  ).rejects.toThrow(/dimension|large|limit/i);
  const bytes = example(),
    view = new DataView(bytes.buffer);
  for (let i = 0; i < bytes.length - 46; i++)
    if (view.getUint32(i, true) === 0x02014b50) {
      view.setUint32(i + 24, 9_000_000, true);
      break;
    }
  await expect(parseWorkbook(bytes)).rejects.toThrow(/expanded|large|limit/i);
});
test("namespace aliases and quoted relationship URLs cannot hide formulas or external links", async () => {
  await expect(
    parseWorkbook(
      change("xl/worksheets/sheet2.xml", (xml) =>
        cell(xml, "C10", "n", "4200000", "SUM(1,2)")
          .replace(/xmlns:x=/g, "xmlns:δ=")
          .replace(/x:/g, "δ:"),
      ),
    ),
  ).rejects.toThrow(/formula|values/i);
  await expect(
    parseWorkbook(
      change("xl/_rels/workbook.xml.rels", (xml) =>
        xml.replace(
          /<\/[^>]+>\s*$/,
          '<Relationship Id="external" Type="link" Target="a>b" TargetMode="External"/></Relationships>',
        ),
      ),
    ),
  ).rejects.toThrow(/external/i);
});
test("actual expansion and duplicate ZIP paths are checked independently of declared sizes", async () => {
  const bytes = example(),
    view = new DataView(bytes.buffer);
  for (let i = 0; i < bytes.length - 46; i++)
    if (view.getUint32(i, true) === 0x02014b50) {
      const local = view.getUint32(i + 42, true);
      view.setUint32(i + 24, 1, true);
      view.setUint32(local + 22, 1, true);
      break;
    }
  await expect(parseWorkbook(bytes)).rejects.toThrow(/actual|expanded|limit/i);
  const duplicate = example(),
    text = Buffer.from(duplicate),
    where = text.lastIndexOf("xl/worksheets/sheet2.xml");
  duplicate.set(Buffer.from("xl/worksheets/sheet1.xml"), where);
  await expect(parseWorkbook(duplicate)).rejects.toThrow(/duplicate|archive/i);
});
