"""Own a fresh synthetic store and a Streamlit process for browser verification."""

import os
import signal
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[2]
    with tempfile.TemporaryDirectory(prefix="spreadline-streamlit-browser-") as directory:
        environment = dict(os.environ)
        environment.update(
            {
                "SPREADLINE_TESTING_ENABLED": "true",
                "SPREADLINE_CASE_DB": str(Path(directory) / "cases.sqlite3"),
                "SPREADLINE_API_TOKEN": "synthetic-streamlit-browser-" + "x" * 48,
                "SPREADLINE_OPERATOR_ID": "streamlit-browser-regression",
                "SPREADLINE_ACCESS_PASSWORD": "synthetic-streamlit-viewer-password",
            }
        )
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "streamlit",
                "run",
                "streamlit_app/app.py",
                "--server.address=127.0.0.1",
                "--server.port=8501",
                "--server.headless=true",
            ],
            cwd=root,
            env=environment,
        )

        def stop(signum, frame):
            if process.poll() is None:
                process.terminate()

        signal.signal(signal.SIGTERM, stop)
        signal.signal(signal.SIGINT, stop)
        try:
            return process.wait()
        finally:
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=10)


if __name__ == "__main__":
    raise SystemExit(main())
