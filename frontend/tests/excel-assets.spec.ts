import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

type Cell = {
  value: string | null;
  type: string;
  numberFormat: string;
  formula: boolean;
};
type Asset = {
  sheets: { name: string; cells: Record<string, Cell> }[];
  entries: string[];
};
const pythonReader = String.raw`
import sys,json,zipfile,posixpath
from datetime import date,timedelta
from decimal import Decimal
from xml.etree import ElementTree as ET
M="{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
R="{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
with zipfile.ZipFile(sys.argv[1]) as z:
    assert z.testzip() is None
    names=z.namelist()
    assert len(names)==len(set(names))
    shared=[]
    if 'xl/sharedStrings.xml' in names:
        shared=[''.join(v.itertext()) for v in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    styles=ET.fromstring(z.read('xl/styles.xml'))
    formats={f.attrib['numFmtId']:f.attrib['formatCode'] for f in styles.findall(M+'numFmts/'+M+'numFmt')}
    xfs=[formats.get(f.attrib['numFmtId'],f.attrib['numFmtId']) for f in styles.findall(M+'cellXfs/'+M+'xf')]
    rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    sheets=[]
    for s in ET.fromstring(z.read('xl/workbook.xml')).findall(M+'sheets/'+M+'sheet'):
        target=rels[s.attrib[R+'id']]
        target=target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
        root=ET.fromstring(z.read(target)); cells={}
        for c in root.findall('.//'+M+'c'):
            t=c.attrib.get('t','n'); v=c.find(M+'v'); value=v.text if v is not None else None
            if t=='s': value=shared[int(value)]
            if t=='inlineStr': value=''.join(c.find(M+'is').itertext())
            fmt=xfs[int(c.attrib.get('s','0'))]
            if value is not None and fmt=='yyyy-mm-dd' and t=='n':
                days=Decimal(value); assert days==days.to_integral()
                value=(date(1899,12,30)+timedelta(days=int(days))).isoformat()
            if value is not None and fmt=='yyyy-mm-dd' and t=='d':
                assert value.endswith('T00:00:00.000Z')
                value=date.fromisoformat(value[:10]).isoformat()
            cells[c.attrib['r']]={'value':value,'type':t,'numberFormat':fmt,'formula':c.find(M+'f') is not None}
        sheets.append({'name':s.attrib['name'],'cells':cells})
    print(json.dumps({'sheets':sheets,'entries':names}))
`;
function asset(name: string): Asset {
  const path = fileURLToPath(
    new URL(`../src/excel/templates/${name}`, import.meta.url),
  );
  return JSON.parse(
    execFileSync("python3", ["-c", pythonReader, path], { encoding: "utf8" }),
  );
}
const blankName = "spreadline-intake-template-v1.xlsx";
const exampleName = "spreadline-alpine-example-v1.xlsx";
const expectedSheets = [
  "Borrower",
  "Financials",
  "Debt and loan",
  "Guarantors",
  "Working capital",
];
const annual = [
  "gross_receipts",
  "cogs",
  "operating_expense_excl_dna_interest_comp",
  "officer_compensation",
  "depreciation",
  "amortization",
  "interest_expense",
  "section_179",
  "k1_distribution",
];
function sheet(book: Asset, name: string) {
  return book.sheets.find((s) => s.name === name)!.cells;
}
const value = (cells: Record<string, Cell>, address: string) =>
  cells[address]?.value ?? null;

test("both real Excel templates contain the five versioned input sheets and no active content", () => {
  for (const name of [blankName, exampleName]) {
    const book = asset(name);
    expect(book.sheets.map((s) => s.name)).toEqual(expectedSheets);
    expect(
      book.entries.some((n) =>
        /vbaProject|externalLinks|embeddings|activeX/i.test(n),
      ),
    ).toBe(false);
    for (const current of book.sheets) {
      expect(value(current.cells, "B4")).toBe("1");
      expect(value(current.cells, "A7")).toBe("Field");
      expect(Object.values(current.cells).some((c) => c.formula)).toBe(false);
    }
  }
});

test("the filled workbook reproduces the complete Alpine request with exact types and values", () => {
  const book = asset(exampleName);
  const borrower = sheet(book, "Borrower"),
    financials = sheet(book, "Financials");
  const debt = sheet(book, "Debt and loan"),
    guarantors = sheet(book, "Guarantors"),
    capital = sheet(book, "Working capital");
  const readAnnual = (column: string) => ({
    period_start: value(financials, `${column}8`),
    period_end: value(financials, `${column}9`),
    ...Object.fromEntries(
      annual.map((key, index) => [
        key,
        value(financials, `${column}${index + 10}`),
      ]),
    ),
  });
  const actual = {
    schema_version: "commercial-assessment-v2",
    borrower_name: value(borrower, "B8"),
    geography: value(borrower, "B9"),
    assessment_as_of: value(borrower, "B10"),
    units: {
      currency: "USD",
      monetary_unit: "dollars",
      annual_rate_unit: "decimal_nominal",
    },
    years: [readAnnual("B"), readAnnual("C")],
    existing_debt: {
      cpltd_annual: value(debt, "B11"),
      operating_lease_annual: value(debt, "B12"),
    },
    proposed_loan: {
      amount: value(debt, "B8"),
      annual_rate: value(debt, "B9"),
      term_months: 120,
      rate_type: "fixed",
      repayment_type: "fully_amortizing",
      payment_frequency: "monthly",
    },
    guarantors: [
      {
        name: value(guarantors, "B8"),
        ownership_percentage: value(guarantors, "B9"),
        wages: value(guarantors, "B10"),
        interest_dividend_income: value(guarantors, "B11"),
        mortgage_pi_annual: value(guarantors, "B12"),
        auto_loan_annual: value(guarantors, "B13"),
        credit_card_min_annual: value(guarantors, "B14"),
      },
    ],
    working_capital: {
      period_start: value(capital, "B8"),
      period_end: value(capital, "B9"),
      ar_increase: value(capital, "B10"),
      inventory_increase: value(capital, "B11"),
      ap_increase: value(capital, "B12"),
      cash_taxes_paid: value(capital, "B13"),
    },
  };
  expect(value(debt, "B10")).toBe("120");
  const expected = JSON.parse(
    readFileSync(
      new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url),
      "utf8",
    ),
  );
  expect(actual).toEqual(expected);
});

test("financial and rate cells remain Excel text while all seven example dates remain native dates", () => {
  const book = asset(exampleName);
  for (const current of book.sheets) {
    for (const [address, cell] of Object.entries(current.cells)) {
      if (!/^[BC](?:[89]|1\d)$/.test(address) || cell.value === null) continue;
      if (cell.numberFormat === "yyyy-mm-dd") {
        expect(["n", "d"]).toContain(cell.type);
        expect(cell.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      } else if (cell.numberFormat === "@") {
        expect(["s", "inlineStr", "str"]).toContain(cell.type);
      }
    }
  }
  const dates = book.sheets
    .flatMap((s) => Object.values(s.cells))
    .filter((c) => c.value !== null && c.numberFormat === "yyyy-mm-dd");
  expect(dates).toHaveLength(7);
  expect(sheet(book, "Financials").B17.value).toBe("0");
});

test("the blank workbook contains no hidden sample values or default financial zeroes", () => {
  const book = asset(blankName);
  const rows: Record<string, number> = {
    Borrower: 10,
    Financials: 18,
    "Debt and loan": 12,
    Guarantors: 14,
    "Working capital": 13,
  };
  for (const name of expectedSheets) {
    const cells = sheet(book, name),
      columns = name === "Financials" ? ["B", "C"] : ["B"];
    for (const column of columns)
      for (let row = 8; row <= rows[name]; row++)
        expect(value(cells, `${column}${row}`)).toBeNull();
  }
});

test("template headings retain the annual units and complete-year input meaning", () => {
  const book = asset(exampleName);
  expect(value(sheet(book, "Financials"), "A12")).toBe(
    "Operating expense excl. D&A, interest and officer pay",
  );
  expect(value(sheet(book, "Debt and loan"), "A11")).toBe(
    "Existing annual principal payments",
  );
  expect(value(sheet(book, "Guarantors"), "A12")).toBe(
    "Annual mortgage principal and interest",
  );
  expect(value(sheet(book, "Financials"), "B7")).toBe("Year 1");
  expect(value(sheet(book, "Financials"), "C7")).toBe("Year 2");
});
