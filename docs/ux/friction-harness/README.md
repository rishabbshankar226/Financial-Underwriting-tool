# Friction-pass task harness

The Playwright harness that counted T1 to T7 for [FRICTION_PASS_2026-10.md](../FRICTION_PASS_2026-10.md). It is not part of CI.

- `meter.ts` holds the counting rules: clicks, keystrokes, screens, scrolls and wait.
- `tasks.spec.ts` scripts one minimal path per task.
- `data/` holds the recorded runs, three per host for each label: `base` (`3451de3`), `after` (`d45d65e`) and
  `final` (`bac34ea`).

## Reproduce the table from the recorded runs

```sh
python3 docs/ux/friction-harness/compare.py
```

## Measure again

1. Link the frontend's packages: `ln -s ../../../frontend/node_modules docs/ux/friction-harness/node_modules`.
2. Start the three servers in separate terminals with `backend/.venv/bin` on `PATH`.
   - **Backend:** `cd backend && SPREADLINE_CASE_DB=/tmp/f.sqlite SPREADLINE_API_TOKEN=spreadline-playwright-only-credential-20261014 SPREADLINE_OPERATOR_ID=friction python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
   - **Frontend:** `cd frontend && VITE_API_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1` (port 5173; the API only allows this origin).
   - **Streamlit host (public mode):**
     - Set `SPREADLINE_TESTING_ENABLED=true` and `SPREADLINE_PUBLIC_ACCESS=true`.
     - Also set `SPREADLINE_CASE_DB`, `SPREADLINE_API_TOKEN` (32 characters or more), `SPREADLINE_OPERATOR_ID` and `SPREADLINE_ACCESS_PASSWORD`.
     - Run `python -m streamlit run streamlit_app/app.py --server.address=127.0.0.1 --server.port=8501 --server.headless=true`.
     - Before measuring a changed bundle, rebuild it (`npm --prefix frontend run build:streamlit`) and reinstall the component into the venv.
3. Run `docs/ux/friction-harness/run-measure.sh <label>`. It writes `out/data/<label>/<host>/T*-run*.json`, and the step screenshots for run 1 go to `out/shots/`. `FRICTION_OUT` moves the output.
4. Run `python3 docs/ux/friction-harness/summarize.py <label>` for one label, or `compare.py out/data` for before against after.

Never run this harness at the same time as the e2e suites: they use the same ports.

## Paths the spec adapts to

The adaptations below give the baseline counts on the old build and measure the shortest path on the new one.

- **Tab to a field:** `tabTo` presses no key when focus is already on the target.
- **Working capital:** the section is opened only when it is closed.
- **T3:** stops at the memo when the first reason already names its factor.
- **T7:** uses "Copy memo as text" when it exists; otherwise it counts the browser's print chord.
