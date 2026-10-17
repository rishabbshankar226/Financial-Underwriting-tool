import { shiftDecimal } from "../decimal";
import type { Accepted, Input, Mode } from "../contracts";
import { assumptionField, workingCapitalPeriod } from "../fieldCatalog";
import { legacyMoney as money } from "../format";
import { EditButton, type OpenEditor } from "./EditButton";

export function AssumptionsView({
  ready,
  accepted,
  canEdit,
  onEdit,
}: {
  ready: boolean;
  accepted: Accepted | null;
  canEdit: boolean;
  onEdit: OpenEditor;
}) {
  return (
    <section>
      <p>
        {ready
          ? "Annual assumptions used by the backend. Select an amount to propose an edit."
          : "Previous accepted assumptions; no active recommendation."}
      </p>
      {accepted && (
        <AssumptionGroups
          input={accepted.input}
          mode={accepted.mode}
          canEdit={canEdit}
          onEdit={onEdit}
        />
      )}
    </section>
  );
}

function AssumptionGroups({
  input,
  mode,
  canEdit,
  onEdit,
}: {
  input: Input;
  mode: Mode;
  canEdit: boolean;
  onEdit: OpenEditor;
}) {
  function assumptionGroup(
    title: string,
    prefix: string,
    values: Record<string, string | number>,
    period?: string,
  ) {
    return (
      <div className="panel" key={prefix}>
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
  return (
    <div className="assumptionsGrid">
      {assumptionGroup(
        "Existing debt",
        "/existing_debt",
        input.existing_debt,
      )}
      {assumptionGroup(
        "Proposed fixed monthly loan",
        "/proposed_loan",
        {
          amount: input.proposed_loan.amount,
          annual_rate: input.proposed_loan.annual_rate,
          term_months: input.proposed_loan.term_months,
        },
      )}
      {assumptionGroup(
        "Working capital",
        "/working_capital",
        {
          ar_increase: input.working_capital.ar_increase,
          inventory_increase: input.working_capital.inventory_increase,
          ap_increase: input.working_capital.ap_increase,
          cash_taxes_paid: input.working_capital.cash_taxes_paid,
        },
        workingCapitalPeriod(input),
      )}
      {input.guarantors.map((g, i) =>
        assumptionGroup(g.name, `/guarantors/${i}`, {
          ownership_percentage: g.ownership_percentage,
          wages: g.wages,
          interest_dividend_income: g.interest_dividend_income,
          mortgage_pi_annual: g.mortgage_pi_annual,
          auto_loan_annual: g.auto_loan_annual,
          credit_card_min_annual: g.credit_card_min_annual,
        }),
      )}
      {input.guarantors.length === 0 && (
        <div className="panel">
          <h2>Business-only fallback</h2>
          <p>
            No guarantors supplied. The backend uses full business
            EBITDA for global coverage.
          </p>
        </div>
      )}
    </div>
  );
}
