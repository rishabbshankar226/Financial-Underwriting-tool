import { shiftDecimal } from "../decimal";
import type { Accepted, Input, Mode } from "../contracts";
import { assumptionField, workingCapitalPeriod } from "../fieldCatalog";
import { legacyMoney as money } from "../format";
import { EditButton, type OpenEditor } from "./EditButton";

type AssumptionProps = {
  ready: boolean;
  accepted: Accepted | null;
  canEdit: boolean;
  onEdit: OpenEditor;
};

function AssumptionGroup({
  title,
  prefix,
  values,
  period,
  input,
  mode,
  canEdit,
  onEdit,
}: {
  title: string;
  prefix: string;
  values: Record<string, string | number>;
  period?: string;
  input: Input;
  mode: Mode;
  canEdit: boolean;
  onEdit: OpenEditor;
}) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {Object.entries(values).map(([key, value]) => {
        const editable = assumptionField(input, mode, prefix, key, value, period);
        return (
          <div className="assumption" key={key}>
            <EditButton field={editable} canEdit={canEdit} onEdit={onEdit}>
              {editable.label}
            </EditButton>
            <strong>
              {editable.unit === "%"
                ? `${money(shiftDecimal(String(value), 2))}%`
                : editable.unit === "months"
                  ? `${value} months`
                  : `$${money(String(value))}`}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

/** Existing debt, the proposed loan and working capital: the assumptions behind business coverage. */
export function DebtLoanView({ ready, accepted, canEdit, onEdit }: AssumptionProps) {
  const input = accepted?.input;
  return (
    <section>
      <p>
        {ready
          ? "Annual assumptions used by the backend. Select an amount to propose an edit."
          : "Previous accepted assumptions; no active recommendation."}
      </p>
      {accepted && input && (
        <div className="assumptionsGrid">
          <AssumptionGroup title="Existing debt" prefix="/existing_debt" values={input.existing_debt}
            input={input} mode={accepted.mode} canEdit={canEdit} onEdit={onEdit} />
          <AssumptionGroup
            title="Proposed fixed monthly loan"
            prefix="/proposed_loan"
            values={{
              amount: input.proposed_loan.amount,
              annual_rate: input.proposed_loan.annual_rate,
              term_months: input.proposed_loan.term_months,
            }}
            input={input} mode={accepted.mode} canEdit={canEdit} onEdit={onEdit}
          />
          <AssumptionGroup
            title="Working capital"
            prefix="/working_capital"
            values={{
              ar_increase: input.working_capital.ar_increase,
              inventory_increase: input.working_capital.inventory_increase,
              ap_increase: input.working_capital.ap_increase,
              cash_taxes_paid: input.working_capital.cash_taxes_paid,
            }}
            period={workingCapitalPeriod(input)}
            input={input} mode={accepted.mode} canEdit={canEdit} onEdit={onEdit}
          />
        </div>
      )}
    </section>
  );
}

/** Guarantors whose outside income and personal debt enter global coverage. */
export function GlobalCashFlowView({ ready, accepted, canEdit, onEdit }: AssumptionProps) {
  const input = accepted?.input;
  return (
    <section>
      <p>
        {ready
          ? "Guarantor income and personal debt used for global coverage. Select an amount to propose an edit."
          : "Previous accepted guarantors; no active recommendation."}
      </p>
      {accepted && input && (
        <div className="assumptionsGrid">
          {input.guarantors.map((g, i) => (
            <AssumptionGroup
              key={i}
              title={g.name}
              prefix={`/guarantors/${i}`}
              values={{
                ownership_percentage: g.ownership_percentage,
                wages: g.wages,
                interest_dividend_income: g.interest_dividend_income,
                mortgage_pi_annual: g.mortgage_pi_annual,
                auto_loan_annual: g.auto_loan_annual,
                credit_card_min_annual: g.credit_card_min_annual,
              }}
              input={input} mode={accepted.mode} canEdit={canEdit} onEdit={onEdit}
            />
          ))}
          {input.guarantors.length === 0 && (
            <div className="panel">
              <h2>Business-only fallback</h2>
              <p>No guarantors supplied. The backend uses full business EBITDA for global coverage.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
