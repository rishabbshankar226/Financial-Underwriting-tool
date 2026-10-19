import { useState } from "react";
import { useAnalysis } from "../useAnalysis";
import { formatDecimal, formatRatioPercent } from "../decimal";
import { metricText } from "../metricDisplay";

export function ModelScope() {
  return (
    <section
      className="modelScope"
      aria-label="Model scope and policy limitations"
    >
      <p>
        <strong>Capacity is policy arithmetic, not a credit approval.</strong>{" "}
        Default rules are illustrative and require institutional validation. The
        weighted-rule score is not a probability of default.
      </p>
      <details>
        <summary>Methodology scope</summary>
        <p>
          FCCR and UCA use simplified definitions. LTV, debt yield, IRR, and NPV
          are not implemented.
        </p>
        <p>
          The assessment's displayed monthly payment is an indicative rounded
          amount. Coverage annual proposed service uses 12 unrounded monthly
          payments. The analysis service's proposed-loan schedule rounds
          principal, interest and payments to cents, so first-year scheduled
          payments can differ from coverage service.
        </p>
      </details>
    </section>
  );
}

export function AnalysisPanels({
  kind,
}: {
  kind: "schedule" | "grid" | "breakevens";
}) {
  const { state, retry } = useAnalysis(),
    [open, setOpen] = useState(false),
    [monthly, setMonthly] = useState(true);
  const title =
    kind === "schedule"
      ? "Cent-rounded proposed-loan schedule"
      : kind === "grid"
        ? "Coverage grid"
        : "Policy breakevens";
  const analysis = state.status === "ready" ? state.analysis : null;
  return (
    <details
      className="panel analysisPanel"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>{title}</summary>
      {open && (
        <>
          {!analysis ? (
            <div role="status">
              <p>
                {state.status === "error"
                  ? state.message
                  : state.status === "none"
                    ? "A current dated assessment is required."
                    : "Preparing server analysis…"}
              </p>
              {state.status === "error" && (
                <button type="button" onClick={retry}>
                  Retry analysis
                </button>
              )}
            </div>
          ) : kind === "schedule" ? (
            <>
              <p>
                Server-generated cents ·{" "}
                {analysis.amortization.status === "available"
                  ? `${analysis.amortization.payment_count} payments`
                  : analysis.amortization.explanation}
              </p>
              {analysis.amortization.status === "available" && (
                <>
                  <label className="sampleSelector">
                    Schedule granularity
                    <select
                      value={monthly ? "monthly" : "annual"}
                      onChange={(event) =>
                        setMonthly(event.target.value === "monthly")
                      }
                    >
                      <option value="monthly">
                        Monthly · first 360 months
                      </option>
                      <option value="annual">Annual · full loan term</option>
                    </select>
                  </label>
                  <div
                    className="tableScroll scheduleScroll"
                    tabIndex={0}
                    role="region"
                    aria-label="Scrollable loan schedule"
                  >
                    <table>
                      <caption>Server-calculated loan schedule</caption>
                      <thead>
                        <tr>
                          <th>{monthly ? "Month" : "Loan year"}</th>
                          <th className="num">Payments · USD</th>
                          <th className="num">Interest · USD</th>
                          <th className="num">Principal · USD</th>
                          <th className="num">Ending balance · USD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthly
                          ? analysis.amortization.monthly_rows.map((row) => (
                              <tr key={row.month}>
                                <th scope="row">{row.month}</th>
                                <td className="num">
                                  {formatDecimal(row.payment, 2)}
                                </td>
                                <td className="num">
                                  {formatDecimal(row.interest, 2)}
                                </td>
                                <td className="num">
                                  {formatDecimal(row.principal, 2)}
                                </td>
                                <td className="num">
                                  {formatDecimal(row.ending_balance, 2)}
                                </td>
                              </tr>
                            ))
                          : analysis.amortization.annual_rows.map((row) => (
                              <tr key={row.loan_year}>
                                <th scope="row">
                                  {row.loan_year} · {row.months} months
                                </th>
                                <td className="num">
                                  {formatDecimal(row.payments, 2)}
                                </td>
                                <td className="num">
                                  {formatDecimal(row.interest, 2)}
                                </td>
                                <td className="num">
                                  {formatDecimal(row.principal, 2)}
                                </td>
                                <td className="num">
                                  {formatDecimal(row.ending_balance, 2)}
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                  {monthly && analysis.amortization.monthly_rows_truncated && (
                    <p>
                      Monthly detail ends after 360 months. Annual rows cover
                      the full term.
                    </p>
                  )}
                  <p>
                    Final payment {analysis.amortization.final_payment} USD ·
                    final adjustment{" "}
                    {analysis.amortization.final_payment_adjustment} USD
                    {analysis.amortization.early_payoff
                      ? " · Early payoff reported by server"
                      : ""}
                  </p>
                  {analysis.amortization.reconciliation && (
                    <div className="reconciliationNote">
                      <p>{analysis.amortization.reconciliation.explanation}</p>
                      <p>
                        Coverage annual service:{" "}
                        {
                          analysis.amortization.reconciliation
                            .coverage_annual_payment
                        }{" "}
                        USD
                        <br />
                        First loan-year payments:{" "}
                        {
                          analysis.amortization.reconciliation
                            .first_loan_year_payments
                        }{" "}
                        USD
                        <br />
                        Server reconciliation difference:{" "}
                        {
                          analysis.amortization.reconciliation
                            .first_loan_year_difference
                        }{" "}
                        USD
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : kind === "grid" ? (
            <>
              <p>
                Server outcomes under the retained policy · projected latest
                period · observed history held fixed.
              </p>
              {analysis.sensitivity.status === "not_applicable" ? (
                <p>Unavailable · {analysis.sensitivity.explanation}</p>
              ) : (
                <div
                  className="tableScroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Scrollable coverage grid"
                >
                  <table>
                    <caption>Revenue and rate coverage grid</caption>
                    <thead>
                      <tr>
                        <th>Revenue change</th>
                        {analysis.sensitivity.rate_changes_bps.map((rate) => (
                          <th key={rate} className="num">
                            +{rate} bps
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.sensitivity.revenue_changes.map((revenue) => (
                        <tr key={revenue}>
                          <th scope="row">{formatRatioPercent(revenue, 0)}</th>
                          {analysis.sensitivity.rate_changes_bps.map((rate) => {
                            const cell = analysis.sensitivity.cells.find(
                              (value) =>
                                value.revenue_change === revenue &&
                                value.proposed_rate_change_bps === rate,
                            );
                            return (
                              <td key={rate} className="gridCell">
                                {!cell || cell.status === "not_applicable" ? (
                                  <>
                                    <strong className="statusBadge">
                                      Unavailable
                                    </strong>
                                    <p>
                                      {cell?.explanation ?? "No cell returned"}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <strong
                                      className="statusBadge"
                                      data-outcome={cell.outcome}
                                    >
                                      {cell.outcome === "approve"
                                        ? "Pass"
                                        : cell.outcome === "decline"
                                          ? "Fail"
                                          : "Review"}{" "}
                                      · {cell.outcome?.toUpperCase()}
                                    </strong>
                                    <span>DSCR {metricText(cell.dscr)}</span>
                                    <span>FCCR {metricText(cell.fccr)}</span>
                                    <span>
                                      Global {metricText(cell.global_dscr)}
                                    </span>
                                  </>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <ul>
                {analysis.sensitivity.held_fixed_assumptions.map(
                  (value, index) => (
                    <li key={index}>{value}</li>
                  ),
                )}
              </ul>
            </>
          ) : (
            <>
              <p>
                Each threshold and cushion is calculated by the server. Negative
                cushions indicate an existing breach.
              </p>
              <div className="tableScroll">
                <table>
                  <caption>Server-calculated policy breakevens</caption>
                  <thead>
                    <tr>
                      <th>Constraint</th>
                      <th>Threshold type</th>
                      <th className="num">Threshold</th>
                      <th className="num">EBITDA breakeven</th>
                      <th className="num">Revenue cushion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.breakevens.rows.map((row) => (
                      <tr key={`${row.constraint}:${row.threshold_kind}`}>
                        <th scope="row">{row.constraint.toUpperCase()}</th>
                        <td>{row.threshold_kind.replace(/_/g, " ")}</td>
                        <td className="num">{row.threshold}</td>
                        <td className="num">
                          {metricText(row.ebitda_breakeven)}
                        </td>
                        <td className="num">
                          {row.revenue_cushion.status === "available" &&
                          row.revenue_cushion.raw_value !== null
                            ? formatRatioPercent(
                                row.revenue_cushion.raw_value,
                                2,
                              )
                            : "Unavailable"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </details>
  );
}
