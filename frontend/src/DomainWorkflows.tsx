import { useEffect, useRef, useState } from "react";
import { apiRequest, fieldErrorsFrom } from "./api";
import { boundedJson } from "./scenarioApi";
import {
  guardConsumerDecision,
  guardSbaResult,
  type ConsumerDecision,
  type SbaResult,
} from "./domainContracts";
import {
  FormField,
  ValidationSummary,
  formValue,
  setFormValue,
  useGuidedForm,
  type FieldSpec,
  type FormValue,
  type GuidedFormModel,
} from "./components/GuidedForm";
import type { Factor } from "./contracts";
import { isDecimal } from "./decimal";
import { percentBeside } from "./format";
import { TraceInspector, type InspectorData } from "./TraceInspector";
import { isEmbeddedWorkspace } from "./transport";

const consumerSample: FormValue = {
  applicant_name: "Synthetic consumer",
  geography: "60601",
  gross_monthly_income: "8000",
  proposed_housing_pi: "1800",
  proposed_housing_tax_ins: "400",
  other_monthly_debt: "500",
  synthetic_credit_score: 720,
  atr_documentation: { income: true, assets: true, debts: true },
};
const receiptsSample: FormValue = {
  schema_version: "sba-screen-v2",
  borrower_name: "Synthetic dated SBA screen",
  assessment_as_of: "2026-10-14",
  naics: "541611",
  annual_receipts_millions: "24.5",
  requested_loan: "500000",
  global_dscr: "1.31",
  sop_version: "8.1",
  transaction_type: "expansion",
  owner_liquid_resources: "0",
  retirement_allowance: "0",
  college_allowance: "0",
  medical_allowance: "0",
  size_evidence: {
    basis: "receipts_three_completed_fiscal_year_average",
    period_start: "2023-01-01",
    period_end: "2025-12-31",
    affiliates: "included",
    source_reference: "Synthetic consolidated tax-return review",
  },
};
const employeeSample: FormValue = {
  ...receiptsSample,
  naics: "332710",
  employees: 100,
  size_evidence: {
    basis: "employees_24_month_pay_period_average_ceiling",
    period_start: "2024-10-01",
    period_end: "2026-09-30",
    affiliates: "included",
    source_reference: "Synthetic 24-month payroll-period review",
  },
};
delete employeeSample.annual_receipts_millions;
const field = (
  pointer: string,
  label: string,
  kind: FieldSpec["kind"],
  extra: Partial<FieldSpec> = {},
): FieldSpec => ({ pointer, label, kind, ...extra });
const consumerFactorLabels: Record<string, string> = {
  back_end_dti: "Total DTI · approval rule",
  back_end_dti_review: "Total DTI · review rule",
  atr_documentation: "Ability-to-repay documentation",
  synthetic_credit_score: "Synthetic credit score",
};

const operatorWords: Record<NonNullable<Factor["comparison_operator"]>, string> = {
  "<": "below",
  ">": "above",
  ">=": "at least",
  "==": "equal to",
};

/** The policy line the server judged a consumer factor against, as returned: " · policy below 50.0%". */
function policyLineText(factor: Factor): string {
  if (!factor.comparison_operator || !isDecimal(factor.threshold)) return "";
  const line = factor.name.includes("dti") ? percentBeside(factor.threshold, []) : factor.threshold;
  return ` · policy ${operatorWords[factor.comparison_operator]} ${line}`;
}

/** A rejection in plain words. When the server names no field, its own reason is the message: "Review the
 * highlighted fields" would point at nothing. */
function rejectionMessage(status: number, detail: unknown, fieldErrors: number): string {
  if (status !== 422)
    return `The evaluation could not be completed (${status}). Your draft is preserved.`;
  if (fieldErrors || typeof detail !== "string" || !detail.trim())
    return "The server rejected these inputs. Review the highlighted fields; your draft is preserved.";
  const reason = detail.trim().replace(/\.$/, "");
  if (/^NAICS \d{6} is unsupported:/.test(reason))
    return `This case couldn't be screened: ${reason}. That is a known limit of the prototype's pinned SBA size table, so correct the code if it is wrong or review the case manually; your draft is preserved.`;
  return `This case couldn't be evaluated: ${reason}. Your draft is preserved.`;
}

function useDomainRequest<T>(
  form: GuidedFormModel,
  guard: (body: unknown) => T,
) {
  const [result, setResult] = useState<{ context: string; value: T } | null>(
      null,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  const context = JSON.stringify(form.values);
  const currentContext = useRef(context);
  currentContext.current = context;
  useEffect(() => {
    active.current?.abort();
    setResult(null);
    setBusy(false);
    setError("");
  }, [context]);
  useEffect(() => () => active.current?.abort(), []);
  async function send(path: string, specs: FieldSpec[]) {
    if (busy) return;
    const input = form.prepare(specs);
    if (!input) return;
    if (isEmbeddedWorkspace()) {
      setError(
        "This testing host does not expose Consumer or SBA routes. Use the standalone workspace connected to the existing API.",
      );
      return;
    }
    const controller = new AbortController();
    active.current?.abort();
    active.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await apiRequest(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const body: unknown = await boundedJson(response, "Domain evaluation");
      if (controller.signal.aborted || currentContext.current !== context)
        return;
      if (!response.ok) {
        const detail =
          body && typeof body === "object" && "detail" in body
            ? body.detail
            : null;
        const fieldErrors = fieldErrorsFrom(body, detail);
        form.reject(fieldErrors);
        throw new Error(rejectionMessage(response.status, detail, fieldErrors.length));
      }
      const accepted = guard(body);
      if (!controller.signal.aborted && currentContext.current === context)
        setResult({ context, value: accepted });
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : "The evaluation could not be completed. Your draft is preserved.",
        );
    } finally {
      if (active.current === controller) setBusy(false);
    }
  }
  return {
    result: result?.context === context ? result.value : null,
    busy,
    error,
    send,
  };
}
function SelectField({
  form,
  pointer,
  label,
  helper,
  options,
  onChange,
}: {
  form: GuidedFormModel;
  pointer: string;
  label: string;
  helper: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}) {
  const id = `choice${pointer.replace(/\//g, "-")}`,
    error = form.errors.find((item) => item.pointer === pointer);
  return (
    <div className="formField">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        data-pointer={pointer}
        value={String(formValue(form.values, pointer))}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={`${id}-help`}
        onChange={(event) =>
          onChange
            ? onChange(event.target.value)
            : form.change(field(pointer, label, "text"), event.target.value)
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <small id={`${id}-help`}>{helper}</small>
      {error && <span className="fieldError">{error.message}</span>}
    </div>
  );
}
function TestingBoundary() {
  return isEmbeddedWorkspace() ? (
    <p className="analysisNotice">
      The private Streamlit host is synthetic data only. Its existing bridge
      supports commercial workflows; this screen requires the standalone API
      connection.
    </p>
  ) : null;
}

export function ConsumerWorkflow() {
  const form = useGuidedForm({
    ...consumerSample,
    applicant_name: "",
    geography: "",
    gross_monthly_income: "",
    proposed_housing_pi: "",
    proposed_housing_tax_ins: "",
    other_monthly_debt: "",
    synthetic_credit_score: "",
    atr_documentation: { income: false, assets: false, debts: false },
  });
  const request = useDomainRequest<ConsumerDecision>(
    form,
    guardConsumerDecision,
  );
  const [preset, setPreset] = useState(""),
    [inspector, setInspector] = useState<InspectorData | null>(null);
  const inspectorOpener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => setInspector(null), [request.result]);
  const specs = [
    field("/applicant_name", "Applicant name", "text"),
    field("/geography", "Consumer geography", "text", { placeholder: "60601" }),
    field("/gross_monthly_income", "Gross monthly income", "money", {
      min: "0",
    }),
    field(
      "/proposed_housing_pi",
      "Monthly housing principal and interest",
      "money",
      { min: "0" },
    ),
    field(
      "/proposed_housing_tax_ins",
      "Monthly housing tax and insurance",
      "money",
      { min: "0" },
    ),
    field("/other_monthly_debt", "Other monthly debt", "money", { min: "0" }),
    field("/synthetic_credit_score", "Synthetic credit score", "integer", {
      min: "300",
      max: "850",
      optional: true,
      placeholder: "720",
      helper:
        "Integer 300–850 · optional; synthetic input, no bureau connection",
    }),
  ];
  const total = request.result?.factors.find(
    (factor) => factor.name === "back_end_dti",
  );
  // Each DTI is rounded once from its raw value, with enough places to compare with both DTI policy lines.
  const dtiLines =
    request.result?.factors
      .filter((factor) => factor.name.includes("dti"))
      .map((factor) => factor.threshold) ?? [];
  const dtiText = (factor: Factor) =>
    percentBeside(
      typeof factor.raw_value === "string" ? factor.raw_value : String(factor.value),
      dtiLines,
    );
  function inspect(housing: boolean, opener: HTMLButtonElement) {
    inspectorOpener.current = opener;
    setInspector({
      title: housing ? "Housing DTI" : "Total DTI",
      factor: housing ? undefined : total,
      formula: housing
        ? "Housing DTI = (monthly housing principal and interest + monthly housing tax and insurance) / gross monthly income"
        : "Total DTI = (monthly housing principal and interest + monthly housing tax and insurance + other monthly debt) / gross monthly income",
      supplied: specs
        .filter((spec) => spec.kind === "money")
        .map((spec) => ({
          label: spec.label,
          value: String(formValue(form.values, spec.pointer)),
        })),
      note: housing
        ? "The existing consumer decision endpoint does not return housing DTI or a housing factor. No housing ratio or sum is calculated in the browser."
        : `Server total DTI: ${total && typeof total.value === "string" ? dtiText(total) : "Unavailable"}. The endpoint returns the policy factor, but no additive trace or housing ratio. Inputs shown above are supplied facts; the browser does not reconstruct financial results.`,
    });
  }
  return (
    <div className="domainWorkspace">
      <header className="caseHeader">
        <h1>Consumer DTI review</h1>
        <p>
          Review supplied income, debt and documentation under the server's
          illustrative policy.
        </p>
      </header>
      <TestingBoundary />
      <section className="panel">
        <label className="sampleSelector">
          Load sample case
          <select
            aria-label="Load sample case"
            value={preset}
            onChange={(event) => {
              setPreset(event.target.value);
              if (event.target.value) form.replace(consumerSample);
            }}
          >
            <option value="">Choose a synthetic preset</option>
            <option value="consumer">
              Consumer · complete DTI and documentation
            </option>
          </select>
        </label>
        <form
          ref={form.root}
          className="guidedForm"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void request.send("/consumer/decision", specs);
          }}
        >
          <ValidationSummary form={form} specs={specs} />
          <div className="formGrid">
            {specs.map((spec) => (
              <FormField key={spec.pointer} form={form} spec={spec} />
            ))}
          </div>
          <fieldset>
            <legend>Ability-to-repay documentation</legend>
            {["income", "assets", "debts"].map((key) => (
              <label className="checkboxField" key={key}>
                <input
                  type="checkbox"
                  data-pointer={`/atr_documentation/${key}`}
                  checked={
                    formValue(form.values, `/atr_documentation/${key}`) === true
                  }
                  onChange={(event) =>
                    form.setValues((previous) =>
                      setFormValue(
                        previous,
                        `/atr_documentation/${key}`,
                        event.target.checked,
                      ),
                    )
                  }
                />
                Verified {key} evidence
              </label>
            ))}
            <p className="fine">
              These are analyst attestations. The application does not
              independently verify documents.
            </p>
          </fieldset>
          {request.error && <p role="alert">{request.error}</p>}
          <button className="primary" type="submit" aria-busy={request.busy}>
            {request.busy ? "Evaluating consumer…" : "Evaluate consumer"}
          </button>
        </form>
      </section>
      {request.result && (
        <section className="panel" role="region" aria-label="Consumer result">
          <h2>Consumer result · {request.result.outcome.toUpperCase()}</h2>
          <p>
            Policy {request.result.policy_version} · weighted-rule score{" "}
            {request.result.score}. The score is not a probability of default.
          </p>
          <div className="domainMetrics">
            <article>
              <h3>Total DTI</h3>
              <strong>
                {total && typeof total.value === "string"
                  ? dtiText(total)
                  : "Unavailable"}
              </strong>
              <button
                type="button"
                onClick={(event) => inspect(false, event.currentTarget)}
              >
                Inspect Total DTI
              </button>
            </article>
            <article>
              <h3>Housing DTI</h3>
              <p>
                Not returned by this prototype's consumer decision. Only total
                (back-end) DTI is compared with the DTI policy lines; Inspect
                shows how housing DTI is worked out.
              </p>
              <button
                type="button"
                onClick={(event) => inspect(true, event.currentTarget)}
              >
                Inspect Housing DTI
              </button>
            </article>
          </div>
          <ul className="factorList">
            {request.result.factors.map((factor) => (
              <li key={factor.name}>
                <div>
                  <strong>
                    {consumerFactorLabels[factor.name] ??
                      factor.name.replace(/_/g, " ")}
                  </strong>
                  <span>
                    {factor.passed === null
                      ? "Unavailable"
                      : factor.passed
                        ? "Pass"
                        : "Fail"}{" "}
                    ·{" "}
                    {typeof factor.value === "boolean"
                      ? factor.value
                        ? "complete"
                        : "incomplete"
                      : factor.name.includes("dti")
                        ? dtiText(factor)
                        : factor.value}
                    {policyLineText(factor)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {request.result.reasons.map((reason) => (
            <p key={reason.code}>{reason.message}</p>
          ))}
          <p className="fine">
            {request.result.disclaimer} DTI boundaries are illustrative policy
            settings, not a claim about legal lending ceilings.
          </p>
        </section>
      )}
      {inspector && (
        <TraceInspector
          data={inspector}
          onClose={() => {
            setInspector(null);
            inspectorOpener.current?.focus();
          }}
        />
      )}
    </div>
  );
}

const requirementLabels: Record<string, string> = {
  lender_credit_elsewhere_determination:
    "Lender credit elsewhere determination",
  industry_selection_and_affiliation_review:
    "Industry selection and affiliation review",
  alternative_size_standards_and_program_eligibility:
    "Alternative size standards and program eligibility",
  approved_lender_credit_policy: "Approved lender credit policy",
};
export function SbaWorkflow() {
  const form = useGuidedForm({
    ...receiptsSample,
    borrower_name: "",
    naics: "",
    annual_receipts_millions: "",
    requested_loan: "",
    global_dscr: "",
    size_evidence: {
      basis: "receipts_three_completed_fiscal_year_average",
      period_start: "",
      period_end: "",
      affiliates: "included",
      source_reference: "",
    },
  });
  const request = useDomainRequest<SbaResult>(form, guardSbaResult),
    [preset, setPreset] = useState("");
  const employees = String(
    formValue(form.values, "/size_evidence/basis"),
  ).startsWith("employees");
  const specs = [
    field("/borrower_name", "SBA borrower name", "text"),
    field("/assessment_as_of", "SBA assessment as of", "date", {
      helper:
        "Pinned source verified through 2026-10-15; later dates are rejected",
    }),
    field("/naics", "NAICS code", "text", {
      placeholder: "541611",
      helper:
        "Six-digit NAICS · ambiguous or unsupported rows require manual review",
    }),
    field("/requested_loan", "SBA requested loan", "money", { min: "0" }),
    field("/global_dscr", "Supplied global DSCR", "money", {
      helper:
        "Exact coverage ratio · supplied evidence; not recomputed by the screen",
      placeholder: "1.31",
    }),
    employees
      ? field("/employees", "Employee average ceiling", "integer", {
          min: "0",
          placeholder: "100",
          helper:
            "Integer ceiling of the 24-month pay-period average · no rounding down",
        })
      : field("/annual_receipts_millions", "Average annual receipts", "money", {
          min: "0",
          placeholder: "24.5",
          helper:
            "USD millions · completed 3- or 5-fiscal-year average, including affiliates",
        }),
    field("/size_evidence/period_start", "Measurement period start", "date"),
    field("/size_evidence/period_end", "Measurement period end", "date"),
    field(
      "/size_evidence/source_reference",
      "Measurement source reference",
      "text",
      {
        placeholder: "Consolidated tax-return review",
        helper: "Required evidence reference · at most 500 characters",
      },
    ),
    ...[
      "owner_liquid_resources",
      "retirement_allowance",
      "college_allowance",
      "medical_allowance",
    ].map((key) =>
      field(`/${key}`, key.replace(/_/g, " "), "money", {
        min: "0",
        helper:
          "USD decimal · supplied evidence only; no legal entitlement is inferred",
      }),
    ),
  ];
  return (
    <div className="domainWorkspace">
      <header className="caseHeader">
        <h1>SBA eligibility screen</h1>
        <p>
          Selected size and coverage screens with explicit unresolved lender
          requirements.
        </p>
      </header>
      <TestingBoundary />
      <section className="panel sourceNotice">
        <h2>Pinned workbook</h2>
        <p>
          Effective March 17, 2023 · verified through October 15, 2026 · 850
          supported unambiguous rows · 128 refused rows with footnotes, industry
          exceptions, or unsupported measures.
        </p>
        <p className="fine">
          A passing size screen does not establish complete SBA eligibility.
          Later source dates and unsupported rows require a separately reviewed
          source update.
        </p>
      </section>
      <section className="panel">
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
                  selected === "sba-employees"
                    ? employeeSample
                    : receiptsSample,
                );
            }}
          >
            <option value="">Choose a synthetic preset</option>
            <option value="sba-receipts">
              SBA · three-year receipts evidence
            </option>
            <option value="sba-employees">
              SBA · 24-month employee evidence
            </option>
          </select>
        </label>
        <form
          ref={form.root}
          className="guidedForm"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void request.send("/sba/evaluate", specs);
          }}
        >
          <ValidationSummary form={form} specs={specs} />
          <div className="formGrid">
            <SelectField
              form={form}
              pointer="/size_evidence/basis"
              label="Measurement basis"
              helper="Completed 3- or 5-fiscal-year receipts average, or latest completed 24-month pay-period employee average ceiling"
              options={[
                {
                  value: "receipts_three_completed_fiscal_year_average",
                  label: "Receipts · 3 complete fiscal years",
                },
                {
                  value: "receipts_five_completed_fiscal_year_average",
                  label: "Receipts · 5 complete fiscal years",
                },
                {
                  value: "employees_24_month_pay_period_average_ceiling",
                  label: "Employees · 24-month average ceiling",
                },
              ]}
              onChange={(value) => {
                form.setValues((previous) => {
                  const next = setFormValue(
                    previous,
                    "/size_evidence/basis",
                    value,
                  );
                  delete next.employees;
                  delete next.annual_receipts_millions;
                  next[
                    value.startsWith("employees")
                      ? "employees"
                      : "annual_receipts_millions"
                  ] = "";
                  return next;
                });
              }}
            />
            <SelectField
              form={form}
              pointer="/size_evidence/affiliates"
              label="Affiliate treatment"
              helper="Include affiliates in the supplied measure, or attest that there are none"
              options={[
                { value: "included", label: "Affiliates included" },
                { value: "none", label: "No affiliates" },
              ]}
            />
            <SelectField
              form={form}
              pointer="/sop_version"
              label="SOP version"
              helper="SOP 8 from June 1, 2025; SOP 8.1 from October 1, 2026 within verified dates"
              options={[
                { value: "8", label: "SOP 8" },
                { value: "8.1", label: "SOP 8.1" },
              ]}
            />
            <SelectField
              form={form}
              pointer="/transaction_type"
              label="Transaction type"
              helper="Server-configured transaction coverage floor"
              options={["expansion", "acquisition", "buyout", "esop"].map(
                (value) => ({ value, label: value }),
              )}
            />
            {specs.map((spec) => (
              <FormField key={spec.pointer} form={form} spec={spec} />
            ))}
          </div>
          <p>
            Owner-resource arithmetic never establishes credit elsewhere.
            Allowances require documented lender review.
          </p>
          {request.error && <p role="alert">{request.error}</p>}
          <button className="primary" type="submit" aria-busy={request.busy}>
            {request.busy ? "Evaluating SBA screen…" : "Evaluate SBA screen"}
          </button>
        </form>
      </section>
      {request.result && (
        <section
          className="panel incompleteEligibility"
          role="region"
          aria-label="SBA result"
        >
          <h2>Incomplete Eligibility — Manual Underwriter Review Required</h2>
          <p>
            Server outcome:{" "}
            <strong>
              {request.result.outcome === "review_required"
                ? "Review required"
                : "Screen failed"}
            </strong>{" "}
            · eligibility_status: incomplete
          </p>
          <ul>
            <li>
              Size screen:{" "}
              <strong>{request.result.size_eligible ? "Pass" : "Fail"}</strong>{" "}
              · {request.result.size_reason}
            </li>
            <li>
              Coverage screen:{" "}
              <strong>{request.result.coverage_pass ? "Pass" : "Fail"}</strong>{" "}
              · supplied DSCR {request.result.global_dscr} · configured floor{" "}
              {request.result.configured_global_dscr_floor}
            </li>
          </ul>
          <h3>Unresolved eligibility requirements</h3>
          <ul>
            {request.result.unresolved_requirements.map((requirement) => (
              <li key={requirement}>{requirementLabels[requirement]}</li>
            ))}
          </ul>
          <p>
            Owner-resource arithmetic never establishes credit elsewhere.{" "}
            {request.result.credit_elsewhere.reason}
          </p>
          <dl className="reviewFacts">
            <div>
              <dt>Policy</dt>
              <dd>{request.result.policy_version}</dd>
            </div>
            <div>
              <dt>Source workbook row</dt>
              <dd>
                {request.result.size_standard_source.row ?? "Unavailable"}
              </dd>
            </div>
            <div>
              <dt>Source effective / verified through</dt>
              <dd>
                {request.result.size_standard_source.effective_date} /{" "}
                {request.result.size_standard_source.verified_through ??
                  "Unavailable"}
              </dd>
            </div>
            <div>
              <dt>Recorded workbook SHA-256</dt>
              <dd>
                {request.result.size_standard_source.sha256 ?? "Unavailable"}
              </dd>
            </div>
          </dl>
          <p className="fine">{request.result.disclaimer}</p>
        </section>
      )}
    </div>
  );
}
