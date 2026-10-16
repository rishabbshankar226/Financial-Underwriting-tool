"""Temporary store identity, kept outside public component assets."""

import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID, uuid4

from backend.app.cases import CaseStore


def _identity(path: Path) -> tuple[int, int]:
    info = path.stat()
    return info.st_dev, info.st_ino


@dataclass(frozen=True)
class TestingStore:
    path: Path
    marker: Path
    generation: str
    device: int
    inode: int

    def is_current(self) -> bool:
        try:
            record = json.loads(self.marker.read_text(encoding="utf-8"))
            return _identity(self.path) == (self.device, self.inode) and record == self._record()
        except (OSError, ValueError):
            return False

    def _record(self) -> dict[str, str | int]:
        return {"version": 1, "generation": self.generation, "device": self.device, "inode": self.inode}


def open_testing_store(path: Path) -> TestingStore:
    path = path.expanduser().resolve()
    path.parent.mkdir(parents=True, mode=0o700, exist_ok=True)
    existed = path.exists()
    CaseStore(path)
    device, inode = _identity(path)
    marker = path.with_suffix(path.suffix + ".generation")
    generation = str(uuid4())
    try:
        if existed and marker.stat().st_size <= 1024:
            record = json.loads(marker.read_text(encoding="utf-8"))
            candidate = record["generation"]
            if (
                isinstance(candidate, str)
                and str(UUID(candidate)) == candidate
                and record == {"version": 1, "generation": candidate, "device": device, "inode": inode}
            ):
                generation = candidate
    except (OSError, ValueError, KeyError, TypeError):
        pass
    result = TestingStore(path, marker, generation, device, inode)
    descriptor, temporary = tempfile.mkstemp(prefix=".generation-", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as output:
            json.dump(result._record(), output)
        os.replace(temporary, marker)
    finally:
        Path(temporary).unlink(missing_ok=True)
    return result
