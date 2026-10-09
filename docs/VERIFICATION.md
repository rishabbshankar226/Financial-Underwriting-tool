# Verification

Run `scripts/run_all_checks.sh` from the repository root with the Python environment active. The setup commands are in the [README](../README.md#verify-the-project). Python 3.12 on Linux and Node 22 are the CI baseline.

## Checks

| Check | What it verifies |
|---|---|
| Python dependency consistency | Installed requirements have compatible versions |
| Independent reference calculator | Core formulas match pinned synthetic results; mutation checks catch known formula errors |
| Backend tests | Inputs, calculations, policy decisions, API contracts, and case storage |
| Frontend dependency audit | No reported high or critical dependency findings |
| Frontend build | TypeScript checks and the Vite production build |
| Browser tests | Workspace behavior against a running backend |

The script stops at the first failure and leaves the command's output visible. Browser tests start development servers, so ports 8000 and 5173 must be free.

These checks establish regression behavior for synthetic fixtures. They do not establish fitness for real lending; see the [model documentation](MODEL_DOCUMENTATION.md) for the validation limits.

## Independent arithmetic checks

`gate/reference_calculator.py` is a second implementation of the core formulas, with pinned results for three synthetic borrowers. The application never imports it. Backend tests compare their results with its expected numbers.

Run the arithmetic and backend checks separately:

```bash
python3 gate/reference_calculator.py --selftest
(cd backend && python3 -m pytest -q)
```

## Dependency pins

`backend/requirements.txt` lists direct dependencies. `backend/constraints-py312.txt` pins their complete resolved versions for Python 3.12 on Linux. CI uses the same constraints for backend and browser tests.

The pinned Starlette 1.7.0 TestClient uses `httpx2` 2.13.1, following [Starlette's supported transport](https://starlette.dev/testclient/). This replaces the deprecated plain `httpx` dependency without filtering warnings or changing application code.

The frontend lockfile pins `source-map-js` 1.2.2 within PostCSS's existing `^1.2.1` range to address [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).

Refresh Python pins in a clean Python 3.12 environment, review each dependency change, and run the complete verification sequence before accepting a new baseline.

## Browser scenario and shared-recovery coverage

The browser suite uses an owned synthetic backend and fresh temporary database.
Scenario checks cover real preview/retention/reload; original baseline identity,
policy, trace and factor links; percentage/basis-point normalization; Unicode
text limits; ordered ten-row batches; historical baselines; preserving the case
head, selected assessment and newer drafts; original JSON compatibility;
26-record archives and cursor cycles; stale preview/detail responses; keyboard
focus and 390px/desktop layout; opened trace/guarantor pages and 64 KiB JSON
pages; actual 16 MiB response boundaries independent of declared lengths; and
shared pending-write behavior across case and comparison commands.

Fault injection covers commit followed by lost or malformed success, exact
retry after reload, storage preflight/clear failure, abort-ignoring transport,
503/Retry-After without automatic retry, known pre-commit 409 codes, and
operation conflict with explicit discard review. Existing case-write-v1
recovery records remain part of the regression checks. The happy-path browser
check records page/console errors and warnings and requires none. Generated
desktop and mobile screenshots remain under `frontend/test-results`.

These checks validate browser/server contract use and synthetic regression
behavior. The browser formats and compares response fields; all financial
arithmetic, policy assessment and stress projection remain in Python. Backend
definitions, dependency pins, storage schemas and CI configuration are unchanged
by the scenario browser work.

## Saved-run review and export coverage

`review-package.spec.ts` crosses the real saved-case/comparison HTTP boundary
and reconciles complete output records and independently pinned raw Alpine
facts. It covers ten-scenario order, full baseline/hash/evidence matching,
unsupported-definition originals, malformed runtime/source values, frozen
capture, deterministic UTF-16 object keys, safe Unicode/special keys/scalars,
source depths 64/100, actual inclusive 16 MiB complete-file boundaries,
wrapper/comparison overhead and cancellation.

`review-workspace.spec.ts` reads actual Chromium download bytes/filenames,
checks explicit inclusion and historical stability after a later server edit,
requires explicit mismatched-baseline navigation, preserves a pending journal,
and prevents export from initial/failed/pending/legacy/unsaved state. It covers
abort-ignoring late completion across navigation/inclusion changes, repeated
clicks, object-URL lifetime, worker validation/malformed completion, oversized
originals without giant Review DOM or truncated output, keyboard use,
390px/1280px screenshots and a clean happy-path console. Intentional fault
fixtures do not establish source authenticity or independently verified hashes.

The exporter formats a browser-parsed original; it never calculates a financial
result, recomputes a hash or invokes backend writes/replay. The complete gate
retains all prior case/scenario regression checks, backend/reference/mutation
checks, dependency audit and production build. No backend, dependency, storage
or CI configuration changes accompany this browser export feature.

## Existing Chromium installations

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to the browser's absolute executable path to use an existing isolated Chromium installation. Keep its required libraries available and omit the Playwright browser download step. CI installs Playwright's bundled Chromium.
