"""Own a fresh local case database and backend process for this browser run."""

import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile


def main():
    root = Path(__file__).resolve().parents[2]
    with tempfile.TemporaryDirectory(prefix="spreadline-playwright-") as directory:
        environment = dict(os.environ)
        environment["SPREADLINE_CASE_DB"] = str(Path(directory) / "cases.sqlite")
        environment.pop("SPREADLINE_BUILD_REVISION", None)
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
            ],
            cwd=root / "backend",
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
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()


if __name__ == "__main__":
    sys.exit(main())
