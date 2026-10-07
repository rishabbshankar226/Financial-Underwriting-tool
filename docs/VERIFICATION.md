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

## Existing Chromium installations

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to the browser's absolute executable path to use an existing isolated Chromium installation. Keep its required libraries available and omit the Playwright browser download step. CI installs Playwright's bundled Chromium.
