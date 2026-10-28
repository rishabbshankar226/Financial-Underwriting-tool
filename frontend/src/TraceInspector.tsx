import { useEffect, useRef } from "react";
import type { Factor, Trace } from "./contracts";
import {
  formatDecimal,
  formatAccounting,
  formatRatioPercent,
  isDecimal,
} from "./decimal";

export const methodologies: Record<string, string> = {
  "gross-profit-v2": "Gross profit = receipts − COGS",
  "ordinary-business-income-v2":
    "Ordinary income = gross profit − operating expense − officer compensation − depreciation − amortization − existing interest − Section 179",
  "ebitda-v2":
    "EBITDA = ordinary income + existing interest + depreciation + amortization + Section 179",
  "amortized-payment-v2":
    "Monthly payment = P × r / (1 − (1 + r)^−n), where r = annual nominal rate / 12; at zero rate, P / n.",
  "annualized-payment-v2":
    "Proposed annual service = 12 unrounded monthly payments",
  "annual-debt-service-v2":
    "Business service = existing interest + annual CPLTD + proposed annual service",
  "dscr-v2": "DSCR = EBITDA / business service",
  "fccr-v2": "FCCR = EBITDA / (business service + operating leases)",
  "global-dscr-v2":
    "Global DSCR = (ownership-weighted EBITDA + outside income) / (business service + personal service). Empty guarantors use 100% of business EBITDA. K-1 distributions are never added a second time.",
  "uca-cash-flow-v2":
    "Simplified UCA = EBITDA − cash taxes − (AR increase + inventory increase − AP increase)",
};
// These are presentation signs from the named specification, never a client calculation.
const signs: Record<string, string[]> = {
  "gross-profit-v2": ["+", "−"],
  "ordinary-business-income-v2": ["+", "−", "−", "−", "−", "−", "−"],
  "ebitda-v2": ["+", "+", "+", "+", "+"],
  "annual-debt-service-v2": ["+", "+", "+"],
  "uca-cash-flow-v2": ["+", "−", "−"],
  "fixed-charge-service-v2": ["+", "+"],
  "guarantor-outside-income-v2": ["+", "+"],
  "guarantor-personal-debt-v2": ["+", "+", "+"],
  "global-cash-flow-v2": ["+", "+"],
  "global-debt-service-v2": ["+", "+"],
  "net-working-capital-v2": ["+", "+", "−"],
};
export type InspectorData = {
  title: string;
  trace?: Trace;
  factor?: Factor;
  formula?: string;
  note?: string;
  supplied?: { label: string; value: string }[];
};
const amount = (value: string | number | null, unit: string) =>
  value === null
    ? "Unavailable"
    : isDecimal(String(value))
      ? unit.startsWith("USD")
        ? formatAccounting(String(value), { places: 2, currency: true })
        : unit === "ratio"
          ? formatDecimal(String(value), 4)
          : String(value)
      : String(value);
export function TraceInspector({
  data,
  onClose,
}: {
  data: InspectorData;
  onClose: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "instant",
    });
  }, [data.title, data.trace?.fact_id]);
  const row = data.trace,
    additive = row
      ? (signs[row.definition_id] ??
        ([
          "global-business-ebitda-v2",
          "global-outside-income-v2",
          "global-personal-debt-v2",
        ].includes(row.definition_id)
          ? row.operands.map(() => "+")
          : undefined))
      : undefined;
  return (
    <aside
      className="panel traceInspector"
      role="region"
      aria-label="Calculation inspector"
    >
      <div className="panelTitle">
        <h2 tabIndex={-1} ref={heading}>
          {data.title}
        </h2>
        <button type="button" onClick={onClose}>
          Close inspector
        </button>
      </div>
      <h3>Exact methodology</h3>
      <p>
        {data.formula ??
          (row
            ? (methodologies[row.definition_id] ?? row.expression)
            : "Methodology unavailable")}
      </p>
      {row && (
        <>
          <p className="fine">
            Definition {row.definition_id} · {row.fact_id}
          </p>
          <p className="expression">{row.expression}</p>
          <h3>Contextual reported operands</h3>
          <ol className="traceOperands">
            {row.operands.map((operand, index) => {
              const allocated =
                operand.unit.startsWith("USD") &&
                operand.raw_value !== null &&
                operand.reported_value !== null &&
                formatDecimal(String(operand.raw_value), 2, false) !==
                  formatDecimal(String(operand.reported_value), 2, false);
              return (
                <li key={index} data-allocated={allocated}>
                  <code>{operand.reference}</code>
                  <strong>
                    {additive?.[index] ?? "Operand"}{" "}
                    {amount(
                      operand.reported_value ?? operand.raw_value,
                      operand.unit,
                    )}
                  </strong>
                  <small>
                    Raw {String(operand.raw_value)} {operand.unit} ·{" "}
                    {operand.reference_type}
                  </small>
                  {allocated && (
                    <span className="allocationBadge">
                      Residual cents allocated by server
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {additive &&
            row.operands.every(
              (operand) => operand.reported_value !== null,
            ) && (
              <p
                className="reconciliationEquation"
                aria-label="Server reported reconciliation"
              >
                {row.operands
                  .map(
                    (operand, index) =>
                      `${index ? `${additive[index]} ` : ""}${amount(operand.reported_value, operand.unit)}`,
                  )
                  .join(" ")}{" "}
                = {amount(row.reported_value, row.unit)}
                <small>
                  Server-recorded signed reconciliation · displayed from
                  recorded operands; no browser sum is recalculated.
                </small>
              </p>
            )}
          <p>
            Reported result:{" "}
            <strong>{amount(row.reported_value, row.unit)}</strong>
            <br />
            Raw result: <code>{row.raw_value ?? "Unavailable"}</code>
          </p>
          {row.explanation && <p>{row.explanation}</p>}
          <h3>ROUND_HALF_EVEN reporting</h3>
          <p>
            Money uses cents; ratios use four decimal places. Additive residual
            cents follow the largest signed rounding residual, with input order
            breaking ties. Raw values and policy decisions are never altered by
            reporting rounding.
          </p>
        </>
      )}
      {data.supplied && (
        <dl className="traceSupplied">
          {data.supplied.map((operand) => (
            <div key={operand.label}>
              <dt>{operand.label}</dt>
              <dd>{operand.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.note && <p>{data.note}</p>}
      <h3>Policy factor verdict</h3>
      {data.factor ? (
        <p>
          <strong className="statusBadge">
            {data.factor.passed === null
              ? "Unavailable"
              : data.factor.passed
                ? "Pass"
                : "Fail"}
          </strong>{" "}
          · Server comparison {data.factor.comparison_operator ?? "unavailable"}{" "}
          {isDecimal(data.factor.threshold) && data.factor.name.includes("dti")
            ? formatRatioPercent(data.factor.threshold, 2)
            : String(data.factor.threshold ?? "unavailable")}
          .{" "}
          {data.factor.raw_value === null &&
            "A zero coverage denominator cannot pass a policy factor."}
        </p>
      ) : (
        <p>
          No separate policy factor is returned for this fact. Zero coverage
          denominators are unavailable and cannot pass a policy factor.
        </p>
      )}
    </aside>
  );
}
