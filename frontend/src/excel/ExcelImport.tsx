import { useEffect, useId, useRef, useState } from "react";
import type { Accepted } from "../contracts";
import type { Draft } from "../workspace";
import type { FieldError } from "../api";
import { focusPointer } from "../components/GuidedForm";
import { readWorkbookFile } from "./workbookJob";
import {
  validateReview,
  type WorkbookReview,
  type WorkbookIssue,
  type ReviewField,
} from "./workbookModel";
import { workbookSheets } from "./workbookFields";
import blankUrl from "./templates/spreadline-intake-template-v1.xlsx?url&inline";
import exampleUrl from "./templates/spreadline-alpine-example-v1.xlsx?url&inline";

const placeholders = {
  text: "Enter name or reference",
  date: "2025-12-31",
  integer: "120",
  rate: "0.105 or 10.5%",
  money: "500000.00",
};
function ReadingStatus({ onCancel }: { onCancel: () => void }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const brief = setTimeout(() => setStage(1), 100),
      slow = setTimeout(() => setStage(2), 1000);
    return () => {
      clearTimeout(brief);
      clearTimeout(slow);
    };
  }, []);
  if (!stage) return null;
  return (
    <div role="status" aria-busy="true">
      Reading workbook…{" "}
      <button type="button" onClick={onCancel}>
        Cancel reading workbook
      </button>
      {stage === 2 && (
        <div className="formGrid excelReadingSkeleton" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}
export function ExcelImport({
  busy,
  blocked,
  serverErrors,
  serverMessage,
  onEvaluate,
  onClose,
}: {
  busy: boolean;
  blocked: string;
  serverErrors: FieldError[];
  serverMessage: string;
  onEvaluate: (draft: Draft) => Promise<Accepted | undefined>;
  onClose: () => void;
}) {
  const id = useId(),
    root = useRef<HTMLFormElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const job = useRef<AbortController | null>(null),
    serial = useRef(0),
    attempted = useRef(false);
  const [review, setReview] = useState<WorkbookReview | null>(null),
    [filename, setFilename] = useState("");
  const [parsing, setParsing] = useState(false),
    [failure, setFailure] = useState("");
  const [rejections, setRejections] = useState<FieldError[]>([]);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  useEffect(
    () => () => {
      serial.current++;
      job.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (attempted.current) {
      setRejections(serverErrors);
      if (serverErrors.length)
        focusPointer(serverErrors[0].pointer, root.current);
    }
  }, [serverErrors]);
  useEffect(() => {
    if (review) heading.current?.focus();
  }, [filename, !!review]);
  const validation = review
    ? validateReview(review)
    : { input: null, issues: [] };
  const issues: WorkbookIssue[] = [
    ...validation.issues.filter((issue) => seen.has(issue.pointer)),
    ...rejections.map((error) => {
      const pointer = error.pointer.startsWith("/input/")
        ? error.pointer.slice(6)
        : error.pointer;
      const field =
        review?.fields.find((f) => f.pointer === pointer) ??
        review?.fields.find((f) => f.pointer.startsWith(pointer + "/"));
      return {
        pointer: field?.pointer ?? pointer,
        sheet: field?.sheet ?? "Workbook",
        cell: field?.cell ?? "",
        message: `${error.code}: ${error.message}${error.limit === null ? "" : ` · limit ${error.limit}`}`,
      };
    }),
  ];
  function change(field: ReviewField, value: string) {
    setReview((current) =>
      current
        ? {
            fields: current.fields.map((f) =>
              f.pointer === field.pointer
                ? { ...f, value, readError: undefined }
                : f,
            ),
          }
        : null,
    );
    setRejections((current) =>
      current.filter((e) => {
        const pointer = e.pointer.startsWith("/input/")
          ? e.pointer.slice(6)
          : e.pointer;
        return (
          pointer !== field.pointer && !field.pointer.startsWith(pointer + "/")
        );
      }),
    );
  }
  async function select(file: File | undefined) {
    if (!file || busy) return;
    const current = ++serial.current;
    job.current?.abort();
    setReview(null);
    setRejections([]);
    setSeen(new Set());
    attempted.current = false;
    setFilename(file.name);
    setFailure("");
    if (!/\.xlsx$/i.test(file.name)) {
      setParsing(false);
      setFailure(
        "Choose an .xlsx workbook. Save legacy .xls or macro-enabled files as a values-only .xlsx copy first.",
      );
      return;
    }
    if (file.size > 2_000_000) {
      setParsing(false);
      setFailure("Choose a workbook no larger than 2 MB (2,000,000 bytes).");
      return;
    }
    const controller = new AbortController();
    job.current = controller;
    setParsing(true);
    try {
      const parsed = await readWorkbookFile(file, controller.signal);
      if (current === serial.current && !controller.signal.aborted) {
        setSeen(
          new Set(validateReview(parsed).issues.map((issue) => issue.pointer)),
        );
        setReview(parsed);
      }
    } catch (reason) {
      if (current === serial.current && !controller.signal.aborted)
        setFailure(
          reason instanceof Error
            ? reason.message
            : "The workbook could not be imported.",
        );
    } finally {
      if (current === serial.current) {
        job.current = null;
        setParsing(false);
      }
    }
  }
  return (
    <section className="excelImport panel" aria-label="Excel intake">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">Commercial assessment</p>
          <h1>Import Excel workbook</h1>
        </div>
        <button type="button" disabled={busy} onClick={onClose}>
          Cancel Excel import
        </button>
      </div>
      <p>
        Use the five-sheet Spreadline template for one to ten complete fiscal
        years, loan assumptions and optional guarantors. Review all inputs
        before evaluation. Use synthetic data only.
      </p>
      <div className="excelDownloads">
        <a
          className="buttonLink"
          href={blankUrl}
          download="spreadline-intake-template-v1.xlsx"
        >
          Download blank Excel template
        </a>
        <a
          className="buttonLink"
          href={exampleUrl}
          download="spreadline-alpine-example-v1.xlsx"
        >
          Download filled Excel example
        </a>
      </div>
      <p className="fine">
        Financial cells in the template use text to preserve precision. The
        importer reads Excel's stored values and cannot restore digits Excel
        already rounded. Replace formulas with values. General-purpose workbook
        layouts require conversion into this template.
      </p>
      <div className="formField">
        <label htmlFor={`${id}-file`}>Excel workbook</label>
        <input
          id={`${id}-file`}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={busy}
          aria-describedby={`${id}-file-help`}
          onChange={(event) => {
            void select(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <small id={`${id}-file-help`}>
          .xlsx · maximum 2 MB · five-second import limit · processed in page
          memory
        </small>
      </div>
      {parsing && (
        <ReadingStatus
          onCancel={() => {
            serial.current++;
            job.current?.abort();
            job.current = null;
            setParsing(false);
            setFailure(
              "Excel import cancelled. Select a workbook to try again.",
            );
          }}
        />
      )}
      {failure && <p role="alert">{failure}</p>}
      {review && (
        <form
          className="guidedForm excelReview"
          ref={root}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (busy) return;
            if (blocked) {
              setFailure(blocked);
              return;
            }
            if (!validation.input) {
              setSeen(new Set(validation.issues.map((issue) => issue.pointer)));
              focusPointer(validation.issues[0]?.pointer ?? "", root.current);
              return;
            }
            attempted.current = true;
            setRejections([]);
            setFailure("");
            void onEvaluate({
              mode: "dated",
              payload: validation.input,
              filename,
              resetHistory: true,
            }).catch((reason) =>
              setFailure(
                reason instanceof Error
                  ? reason.message
                  : "Evaluation failed. Your workbook inputs are preserved.",
              ),
            );
          }}
        >
          <h2 ref={heading} tabIndex={-1}>
            Review Excel inputs
          </h2>
          <p className="excelFilename">
            {filename} · USD dollars · fixed-rate, fully amortizing monthly loan
          </p>
          <p>
            Correct inputs here or select a replacement workbook. An entirely
            blank guarantor column means no guarantor. Evaluation sends only the
            reviewed assessment fields. Saving is a separate action.
          </p>
          {issues.length > 0 && (
            <section
              className="validationSummary"
              role="region"
              aria-label="Excel validation summary"
              aria-live="polite"
            >
              <h2>
                Review {issues.length} input{" "}
                {issues.length === 1 ? "issue" : "issues"}
              </h2>
              <ul>
                {issues.map((issue, i) => (
                  <li key={`${issue.pointer}:${i}`}>
                    <button
                      type="button"
                      onClick={() => focusPointer(issue.pointer, root.current)}
                    >
                      {issue.sheet}
                      {issue.cell ? `!${issue.cell}` : ""}: {issue.message}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {workbookSheets.map((sheet) => (
            <details
              className="excelSheet"
              key={sheet.name}
              open={sheet.name === "Borrower"}
            >
              <summary>{sheet.name}</summary>
              <div className="formGrid">
                {review.fields
                  .filter((f) => f.sheet === sheet.name)
                  .map((field) => {
                    const index = review.fields.indexOf(field),
                      control = `${id}-${index}`,
                      error = issues.find((i) => i.pointer === field.pointer);
                    return (
                      <div className="formField" key={field.pointer}>
                        <label htmlFor={control}>
                          {field.label} · {field.group}
                        </label>
                        <input
                          id={control}
                          data-pointer={field.pointer}
                          type="text"
                          inputMode={
                            field.kind === "integer"
                              ? "numeric"
                              : ["money", "rate"].includes(field.kind)
                                ? "decimal"
                                : "text"
                          }
                          value={field.value}
                          readOnly={busy}
                          maxLength={2000}
                          placeholder={placeholders[field.kind]}
                          aria-invalid={error ? "true" : undefined}
                          aria-describedby={`${control}-help${error ? ` ${control}-error` : ""}`}
                          onBlur={() =>
                            setSeen(
                              (current) => new Set([...current, field.pointer]),
                            )
                          }
                          onChange={(event) =>
                            change(field, event.target.value)
                          }
                        />
                        <small id={`${control}-help`}>
                          {field.sheet}!{field.cell} · {field.helper}
                        </small>
                        {error && (
                          <span className="fieldError" id={`${control}-error`}>
                            {error.message}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </details>
          ))}
          {blocked && <p role="status">{blocked}</p>}
          {attempted.current && serverMessage && (
            <p role="alert">
              {serverMessage} Your Excel review values are preserved.
            </p>
          )}
          <button type="submit" className="primary" aria-busy={busy}>
            {busy ? "Evaluating…" : "Evaluate Excel inputs"}
          </button>
        </form>
      )}
    </section>
  );
}
