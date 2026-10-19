import { useEffect, useState } from "react";
import type { FieldError } from "./api";
import type { Draft } from "./workspace";
import { describeFieldPath, editableField } from "./fieldCatalog";
import {
  FormField,
  ValidationSummary,
  cloneForm,
  formValue,
  pointerParts,
  useGuidedForm,
  type FieldSpec,
  type FormValue,
} from "./components/GuidedForm";

/** Correct a located rejection without replacing the complete draft or resubmitting a saved write. */
export function RejectedInputFields({
  draft,
  errors,
  savedField,
  rationale,
  onEvaluate,
  onReviewSaved,
}: {
  draft: Draft;
  errors: FieldError[];
  savedField?: string;
  rationale?: string;
  onEvaluate: (draft: Draft) => void;
  onReviewSaved?: (
    next: string | number,
    rationale: string,
    opener: HTMLElement,
  ) => Promise<void>;
}) {
  const form = useGuidedForm({
    ...cloneForm(draft.payload as unknown as FormValue),
    ...(savedField ? { rationale: rationale ?? "" } : {}),
  });
  const [failure, setFailure] = useState("");
  const located = errors.map((error) => ({
    ...error,
    pointer: error.pointer.startsWith("/input/")
      ? error.pointer.slice(6)
      : error.pointer,
  }));
  useEffect(() => {
    form.reject(located);
  }, [errors]);
  const paths = [
    ...new Set([
      ...located.map((error) => error.pointer),
      ...(typeof formValue(form.values, "/proposed_loan/term_months") ===
      "string"
        ? ["/proposed_loan/term_months"]
        : []),
      ...(savedField ? [savedField, "/rationale"] : []),
    ]),
  ];
  const specs: FieldSpec[] = paths.flatMap<FieldSpec>((pointer) => {
    if (
      !pointer ||
      pointerParts(pointer).some((key) =>
        ["__proto__", "constructor", "prototype"].includes(key),
      )
    )
      return [];
    try {
      const field = editableField(draft.payload, draft.mode, pointer);
      if (field.path !== pointer) return [];
      return [
        {
          pointer,
          label: describeFieldPath(pointer),
          kind: field.integer
            ? "integer"
            : field.unit === "%"
              ? "rate"
              : "money",
          min: field.min === undefined ? undefined : String(field.min),
          max: field.max === undefined ? undefined : String(field.max),
        } satisfies FieldSpec,
      ];
    } catch {
      // Only known scalar structure is editable here; unknown fields need a corrected complete import.
      if (
        /^\/(assessment_as_of|borrower_name|geography|rationale)$/.test(
          pointer,
        ) ||
        /^\/(years\/(?:0|[1-9]\d*)|working_capital)\/period_(start|end)$/.test(
          pointer,
        )
      )
        return [
          {
            pointer,
            label: describeFieldPath(pointer),
            kind: /period_(start|end)$|assessment_as_of$/.test(pointer)
              ? "date"
              : "text",
          } satisfies FieldSpec,
        ];
      return [];
    }
  });
  return (
    <section
      className="panel rejectedInputFields"
      aria-label="Correct rejected inputs"
    >
      <h2>Review rejected inputs</h2>
      <p>
        Your complete draft is preserved. A saved edit requires review against
        the latest stored revision before a fresh operation can be sent.
      </p>
      <form
        ref={form.root}
        className="guidedForm"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const prepared = form.prepare(specs);
          if (!prepared || !specs.length) return;
          if (savedField && onReviewSaved) {
            const next = formValue(prepared, savedField);
            if (typeof next !== "string" && typeof next !== "number") return;
            const element =
              event.currentTarget.querySelector<HTMLButtonElement>(
                "button[type=submit]",
              );
            if (element)
              void onReviewSaved(
                next,
                String(prepared.rationale),
                element,
              ).catch((reason) =>
                setFailure(
                  reason instanceof Error
                    ? reason.message
                    : "The latest revision could not be reviewed. Your correction is preserved.",
                ),
              );
          } else {
            const edit = draft.edit
              ? {
                  ...draft.edit,
                  next: formValue(prepared, draft.edit.path) as string | number,
                }
              : undefined;
            onEvaluate({
              ...draft,
              payload: prepared as unknown as Draft["payload"],
              rawJson: undefined,
              edit,
            });
          }
        }}
      >
        <ValidationSummary form={form} specs={specs} />
        <div className="formGrid">
          {specs.map((spec) => (
            <FormField key={spec.pointer} form={form} spec={spec} />
          ))}
        </div>
        {!specs.length ? (
          <p>
            These errors require a corrected complete case file. The original
            rejection and field locations remain above.
          </p>
        ) : (
          <button type="submit" className="primary">
            {savedField
              ? "Review corrected revision"
              : "Evaluate corrected draft"}
          </button>
        )}
        {failure && <p role="alert">{failure}</p>}
      </form>
    </section>
  );
}
