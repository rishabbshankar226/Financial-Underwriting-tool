import { structuralHints } from "./formContracts";
import { useEffect, useRef, useState } from "react";
import {
  annualFields,
  type Accepted,
  type Input,
  type Mode,
} from "./contracts";
import { datedSample, legacySample } from "./sampleCases";
import { fieldLabels } from "./fieldCatalog";
import type { Draft } from "./workspace";
import type { FieldError } from "./api";
import {
  FormField,
  ValidationSummary,
  cloneForm,
  focusPointer,
  useGuidedForm,
  type FieldSpec,
  type FormValue,
} from "./components/GuidedForm";

function emptyInput(mode: Mode): FormValue {
  const sample = cloneForm(
    (mode === "dated" ? datedSample : legacySample) as unknown as FormValue,
  );
  const clear = (value: unknown, key = ""): unknown => {
    if (Array.isArray(value))
      return key === "guarantors"
        ? []
        : value.slice(0, 1).map((item) => clear(item));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([name, item]) => [name, clear(item, name)]),
      );
    return [
      "schema_version",
      "currency",
      "monetary_unit",
      "annual_rate_unit",
      "rate_type",
      "repayment_type",
      "payment_frequency",
    ].includes(key)
      ? value
      : "";
  };
  return clear(sample) as FormValue;
}
const spec = (
  pointer: string,
  label: string,
  kind: FieldSpec["kind"],
  extra: Partial<FieldSpec> = {},
): FieldSpec => ({ pointer, label, kind, ...extra });
export function CommercialComposer({
  mode,
  initial,
  serverErrors,
  serverMessage,
  busy,
  onEvaluate,
  onClose,
}: {
  mode: Mode;
  initial?: Input;
  serverErrors: FieldError[];
  serverMessage: string;
  busy: boolean;
  onEvaluate: (draft: Draft) => Promise<Accepted | undefined>;
  onClose: () => void;
}) {
  const form = useGuidedForm(
    initial ? cloneForm(initial as unknown as FormValue) : emptyInput(mode),
  );
  const [preset, setPreset] = useState("");
  const years = form.values.years as FormValue[],
    guarantors = form.values.guarantors as FormValue[];
  useEffect(() => {
    if (serverErrors.length) form.reject(serverErrors);
  }, [serverErrors]);
  // After a period or guarantor is added or removed, focus goes to a field that still exists: the added block's
  // first field, or a neighbour of the removed one; otherwise it falls to the page.
  const focusAfter = useRef<string | null>(null);
  const addGuarantor = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const pointer = focusAfter.current;
    if (pointer === null) return;
    focusAfter.current = null;
    if (pointer === "") addGuarantor.current?.focus();
    else focusPointer(pointer, form.root.current);
  });
  const identity = [
    spec("/borrower_name", "Borrower name", "text"),
    spec("/geography", "Geography", "text", {
      placeholder: "60601",
      helper: "ZIP code or supplied geographic reference",
    }),
    ...(mode === "dated"
      ? [spec("/assessment_as_of", "Assessment as of", "date")]
      : []),
  ];
  const annual = years.map((_, index) => [
    ...(mode === "dated"
      ? [
          spec(
            `/years/${index}/period_start`,
            `Period start · Period ${index + 1}`,
            "date",
          ),
          spec(
            `/years/${index}/period_end`,
            `Period end · Period ${index + 1}`,
            "date",
          ),
        ]
      : []),
    ...annualFields.map((key) =>
      spec(
        `/years/${index}/${key}`,
        `${fieldLabels[key]} · Period ${index + 1}`,
        "money",
        key === "interest_expense" ? { min: "0" } : {},
      ),
    ),
  ]);
  const debt = [
    spec("/existing_debt/cpltd_annual", "Annual CPLTD", "money", { min: "0" }),
    spec(
      "/existing_debt/operating_lease_annual",
      "Annual operating lease",
      "money",
      { min: "0" },
    ),
    spec("/proposed_loan/amount", "Requested principal", "money", { min: "0" }),
    spec("/proposed_loan/annual_rate", "Annual nominal rate", "rate", {
      min: "0",
      max: "1",
    }),
    spec("/proposed_loan/term_months", "Loan term", "integer", {
      min: mode === "dated" ? "12" : "1",
      max: "12000",
      helper:
        mode === "dated"
          ? "Months 12–12,000 · integer"
          : "Positive whole months · integer",
    }),
  ];
  const capital = [
    ...(mode === "dated"
      ? [
          spec(
            "/working_capital/period_start",
            "Working capital period start",
            "date",
          ),
          spec(
            "/working_capital/period_end",
            "Working capital period end",
            "date",
          ),
        ]
      : []),
    ...[
      "ar_increase",
      "inventory_increase",
      "ap_increase",
      "cash_taxes_paid",
    ].map((key) =>
      spec(`/working_capital/${key}`, fieldLabels[key] ?? key, "money"),
    ),
  ];
  const owners = guarantors.map((_, index) => [
    spec(`/guarantors/${index}/name`, `Guarantor ${index + 1} name`, "text"),
    spec(
      `/guarantors/${index}/ownership_percentage`,
      `Guarantor ${index + 1} ownership`,
      "rate",
      {
        min: "0",
        max: "1",
        helper: "Ownership [0, 1] · combined ownership validated by server",
      },
    ),
    ...[
      "wages",
      "interest_dividend_income",
      "mortgage_pi_annual",
      "auto_loan_annual",
      "credit_card_min_annual",
    ].map((key) =>
      spec(
        `/guarantors/${index}/${key}`,
        `Guarantor ${index + 1} ${fieldLabels[key] ?? key.replace(/_/g, " ")}`,
        "money",
        ["wages", "interest_dividend_income"].includes(key) ? {} : { min: "0" },
      ),
    ),
  ]);
  const specs = [
    ...identity,
    ...annual.flat(),
    ...debt,
    ...capital,
    ...owners.flat(),
  ];
  const fields = (rows: FieldSpec[]) => (
    <div className="formGrid">
      {rows.map((field) => (
        <FormField
          key={field.pointer}
          form={form}
          spec={field}
          pasteHint="use Excel intake with the standard template to enter a whole column."
        />
      ))}
    </div>
  );
  return (
    <section className="panel composerPanel">
      <div className="panelTitle">
        <div>
          <h1>
            {mode === "dated"
              ? "Build a dated assessment"
              : "Build an undated decision"}
          </h1>
          <p>
            Enter source facts. The server calculates every financial result and
            policy verdict.
          </p>
        </div>
        <button type="button" onClick={onClose}>
          Return to workspace
        </button>
      </div>
      <label className="sampleSelector">
        Load sample case
        <select
          aria-label="Load sample case"
          value={preset}
          onChange={(event) => {
            const selected = event.target.value;
            setPreset(selected);
            if (selected)
              form.replace(
                (mode === "dated"
                  ? datedSample
                  : legacySample) as unknown as FormValue,
              );
          }}
        >
          <option value="">Choose a synthetic preset</option>
          <option value={mode === "dated" ? "dated" : "legacy"}>
            {mode === "dated"
              ? "Alpine · Dated v2 · exact decimal strings"
              : "Alpine · Undated commercial decision"}
          </option>
        </select>
      </label>
      <form
        ref={form.root}
        className="guidedForm"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          const payload = form.prepare(specs);
          if (!payload) return;
          void onEvaluate({
            mode,
            payload: payload as unknown as Input,
            filename: "Analyst-entered case",
            resetHistory: true,
          });
        }}
      >
        <ValidationSummary form={form} specs={specs} />
        {serverMessage && <p role="alert">{serverMessage}</p>}
        <fieldset>
          <legend>Case identity</legend>
          {fields(identity)}
        </fieldset>
        {mode === "dated" && (
          <div
            className="structuralHints"
            aria-label="Fiscal-period structural hints"
          >
            {structuralHints(form.values).map((hint) => (
              <span data-valid={hint.valid} key={hint.label}>
                {hint.valid ? "Ready" : "Review"} · {hint.label}
              </span>
            ))}
            <p className="fine">
              Structural hints are non-blocking. The server validates fiscal
              dates and working capital.
            </p>
          </div>
        )}
        {annual.map((rows, index) => (
          <details open key={index}>
            <summary>Financial period {index + 1}</summary>
            {fields(rows)}
            {years.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  focusAfter.current = `/years/${Math.min(index, years.length - 2)}`;
                  form.setValues((previous) => ({
                    ...previous,
                    years: years.filter((_, position) => position !== index),
                  }));
                }}
              >
                Remove period {index + 1}
              </button>
            )}
          </details>
        ))}
        <button
          type="button"
          onClick={() => {
            if (years.length < 10) focusAfter.current = `/years/${years.length}`;
            if (years.length < 10)
              form.setValues((previous) => ({
                ...previous,
                years: [
                  ...years,
                  Object.fromEntries(
                    Object.keys(years[0]).map((key) => [key, ""]),
                  ),
                ],
              }));
          }}
        >
          Add financial period
        </button>
        <details open>
          <summary>Debt and proposed loan</summary>
          {fields(debt)}
          {mode === "dated" && (
            <p className="fine">
              Fixed rate · fully amortizing · monthly payments. These
              conventions remain explicit in the request.
            </p>
          )}
        </details>
        {/* Required for an assessment, so open like the periods and debt above it. */}
        <details open>
          <summary>Working capital and cash taxes</summary>
          {fields(capital)}
        </details>
        <details>
          <summary>Guarantors ({guarantors.length})</summary>
          {!guarantors.length && (
            <p>
              Business-only fallback; the backend uses full business EBITDA when
              guarantors are empty.
            </p>
          )}
          {owners.map((rows, index) => (
            <fieldset key={index}>
              <legend>Guarantor {index + 1}</legend>
              {fields(rows)}
              <button
                type="button"
                onClick={() => {
                  focusAfter.current =
                    guarantors.length > 1 ? `/guarantors/${Math.min(index, guarantors.length - 2)}` : "";
                  form.setValues((previous) => ({
                    ...previous,
                    guarantors: guarantors.filter(
                      (_, position) => position !== index,
                    ),
                  }));
                }}
              >
                Remove guarantor {index + 1}
              </button>
            </fieldset>
          ))}
          <button
            ref={addGuarantor}
            type="button"
            onClick={() => {
              focusAfter.current = `/guarantors/${guarantors.length}`;
              form.setValues((previous) => ({
                ...previous,
                guarantors: [
                  ...guarantors,
                  Object.fromEntries(
                    Object.keys(datedSample.guarantors[0]).map((key) => [
                      key,
                      "",
                    ]),
                  ),
                ],
              }));
            }}
          >
            Add guarantor
          </button>
        </details>
        <p className="fine">
          Drafts remain in page memory. Evaluation replaces the unsaved
          selection; saving a case is a separate reviewed action.
        </p>
        <button className="primary" type="submit" aria-busy={busy}>
          {busy
            ? "Evaluating assessment…"
            : mode === "dated"
              ? "Evaluate assessment"
              : "Evaluate decision"}
        </button>
      </form>
    </section>
  );
}
