"""New stores must not inherit permissive process file creation permissions."""

import os
import stat
import subprocess
import sys
from pathlib import Path

import pytest


@pytest.mark.skipif(os.name != "posix", reason="POSIX mode contract")
def test_new_store_is_private_even_with_permissive_umask(tmp_path: Path) -> None:
    destination = tmp_path / "private.sqlite3"
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            "from app.cases import CaseStore; import sys; CaseStore(sys.argv[1])",
            str(destination),
        ],
        cwd=Path(__file__).parents[1],
        capture_output=True,
        text=True,
        check=False,
        umask=0,
    )
    assert result.returncode == 0, result.stderr
    assert stat.S_IMODE(destination.stat().st_mode) == 0o600
