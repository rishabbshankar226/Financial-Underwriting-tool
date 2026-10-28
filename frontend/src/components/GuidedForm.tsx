import { useEffect, useId, useRef, useState } from "react";
import {
  cloneForm,
  formValue,
  parseField,
  setFormValue,
  type FieldKind,
  type FieldSpec,
  type FormValue,
} from "../formContracts";
export {
  cloneForm,
  formValue,
  parseField,
  setFormValue,
  pointerParts,
  type FieldKind,
  type FieldSpec,
  type FormValue,
} from "../formContracts";
import type { FieldError } from "../api";
import { queryWorkspace } from "../workspaceDom";

export function focusPointer(pointer: string, root?: HTMLElement | null): void {
  const controls =
    root?.querySelectorAll<HTMLElement>("[data-pointer]") ??
    queryWorkspace<HTMLElement>(".guidedForm")?.querySelectorAll<HTMLElement>(
      "[data-pointer]",
    );
  const target = pointer.startsWith("/input/") ? pointer.slice(6) : pointer;
  const all = Array.from(controls ?? []);
  const control =
    all.find((element) => element.dataset.pointer === target) ??
    all.find((element) => element.dataset.pointer?.startsWith(`${target}/`));
  if (!control) return;
  let parent = control.parentElement;
  while (parent) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    parent = parent.parentElement;
  }
  control.focus();
  control.scrollIntoView({ block: "center", behavior: "instant" });
}

export function useGuidedForm(initial: FormValue) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [focus, setFocus] = useState(0);
  const root = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (focus && errors.length) focusPointer(errors[0].pointer, root.current);
  }, [focus]);
  function replace(next: FormValue) {
    setValues(cloneForm(next));
    setErrors([]);
  }
  function change(spec: FieldSpec, next: unknown) {
    setValues((previous) => setFormValue(previous, spec.pointer, next));
    try {
      parseField(spec, next);
      setErrors((previous) =>
        previous.filter((error) => error.pointer !== spec.pointer),
      );
    } catch {
      /* Show new errors on blur or evaluation. */
    }
  }
  function blur(spec: FieldSpec) {
    try {
      parseField(spec, formValue(values, spec.pointer));
    } catch (reason) {
      const error: FieldError = {
        pointer: spec.pointer,
        code: "invalid_input",
        message:
          reason instanceof Error ? reason.message : "Review this field.",
        limit: null,
      };
      // Replace a listed error in place: moving it would reorder the summary under a click on one of its links.
      setErrors((previous) =>
        previous.some((item) => item.pointer === spec.pointer)
          ? previous.map((item) => (item.pointer === spec.pointer ? error : item))
          : [...previous, error],
      );
    }
  }
  function reject(items: FieldError[]) {
    setErrors(items);
    setFocus((serial) => serial + 1);
  }
  function prepare(specs: FieldSpec[]): FormValue | null {
    let result = cloneForm(values);
    const found: FieldError[] = [];
    for (const spec of specs) {
      try {
        result = setFormValue(
          result,
          spec.pointer,
          parseField(spec, formValue(values, spec.pointer)),
        );
      } catch (reason) {
        found.push({
          pointer: spec.pointer,
          code: "invalid_input",
          message:
            reason instanceof Error ? reason.message : "Review this field.",
          limit: null,
        });
      }
    }
    if (found.length) {
      reject(found);
      return null;
    }
    setErrors([]);
    return result;
  }
  return {
    values,
    setValues,
    errors,
    root,
    replace,
    change,
    blur,
    reject,
    prepare,
  };
}
export type GuidedFormModel = ReturnType<typeof useGuidedForm>;

export function ValidationSummary({
  form,
  specs,
}: {
  form: GuidedFormModel;
  specs: FieldSpec[];
}) {
  if (!form.errors.length) return null;
  return (
    <section
      className="validationSummary"
      role="region"
      aria-label="Validation summary"
      aria-live="polite"
    >
      <h2>
        Review {form.errors.length} input{" "}
        {form.errors.length === 1 ? "issue" : "issues"}
      </h2>
      <ul>
        {form.errors.map((error, index) => (
          <li key={`${error.pointer}:${index}`}>
            <button
              type="button"
              onClick={() => focusPointer(error.pointer, form.root.current)}
            >
              {specs.find((spec) => spec.pointer === error.pointer)?.label ??
                (error.pointer || "Complete document")}
              : {error.message}
            </button>
            {error.limit !== null && <small>Limit {error.limit}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}

const examples: Record<FieldKind, string> = {
  money: "500000.00",
  rate: "0.105",
  integer: "120",
  text: "Enter name or reference",
  date: "2025-12-31",
};
const helpers: Record<FieldKind, string> = {
  money: "Dollar amount, such as 500,000",
  rate: "Decimal rate, such as 0.105 for 10.5%",
  integer: "Whole number",
  text: "Text",
  date: "Date as YYYY-MM-DD",
};
export function FormField({
  form,
  spec,
}: {
  form: GuidedFormModel;
  spec: FieldSpec;
}) {
  const id = useId(),
    error = form.errors.find((item) => item.pointer === spec.pointer);
  return (
    <div className="formField">
      <label htmlFor={id}>{spec.label}</label>
      <input
        id={id}
        data-pointer={spec.pointer}
        type="text"
        inputMode={
          ["money", "rate"].includes(spec.kind)
            ? "decimal"
            : spec.kind === "integer"
              ? "numeric"
              : "text"
        }
        value={String(formValue(form.values, spec.pointer) ?? "")}
        placeholder={spec.placeholder ?? examples[spec.kind]}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        onBlur={() => form.blur(spec)}
        onChange={(event) => form.change(spec, event.target.value)}
      />
      <small id={`${id}-help`}>
        {spec.helper ??
          `${helpers[spec.kind]}${spec.min !== undefined ? ` · minimum ${spec.min}` : ""}${spec.max !== undefined ? ` · maximum ${spec.max}` : ""}`}
      </small>
      {error && (
        <span id={`${id}-error`} className="fieldError">
          {error.message}
          {error.limit !== null ? ` · limit ${error.limit}` : ""}
        </span>
      )}
    </div>
  );
}
