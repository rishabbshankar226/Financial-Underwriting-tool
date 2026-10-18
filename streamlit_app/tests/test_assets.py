import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
_spec = importlib.util.spec_from_file_location("streamlit_assets", ROOT / "scripts/streamlit_assets.py")
assert _spec is not None and _spec.loader is not None
assets = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(assets)

OLD = {"version": 1, "source_sha256": "0" * 64, "bundle": "index-Old.js", "bundle_sha256": "1" * 64}
NEW = {"version": 1, "source_sha256": "0" * 64, "bundle": "index-New.js", "bundle_sha256": "2" * 64}
BODY = "streamlit==1.66.0\n./streamlit_app/component\n# Hosts reinstall only when this file changes.\n"


def stamp_lines(text: str) -> list[str]:
    return [line for line in text.splitlines() if line.startswith("# component-bundle: ")]


def test_stamp_is_appended_when_missing():
    stamped = assets.stamped_requirements(BODY, NEW)
    assert stamped == BODY + f"# component-bundle: index-New.js {'2' * 64}\n"


def test_a_new_bundle_replaces_the_previous_stamp_and_keeps_every_other_line():
    stamped = assets.stamped_requirements(assets.stamped_requirements(BODY, OLD), NEW)
    assert stamp_lines(stamped) == [f"# component-bundle: index-New.js {'2' * 64}"]
    assert stamped.splitlines()[:-1] == BODY.splitlines()


def test_stamping_is_idempotent():
    once = assets.stamped_requirements(BODY, NEW)
    assert assets.stamped_requirements(once, NEW) == once


def test_the_committed_requirements_name_the_committed_bundle():
    manifest = json.loads((assets.BUILD / "manifest.json").read_text(encoding="utf-8"))
    requirements = assets.REQUIREMENTS.read_text(encoding="utf-8")
    assert requirements == assets.stamped_requirements(requirements, manifest)
    assert stamp_lines(requirements) == [f"# component-bundle: {manifest['bundle']} {manifest['bundle_sha256']}"]


def test_check_rejects_a_stale_requirements_stamp(tmp_path, monkeypatch):
    stale = tmp_path / "requirements.txt"
    stale.write_text(assets.stamped_requirements(BODY, OLD), encoding="utf-8")
    monkeypatch.setattr(assets, "REQUIREMENTS", stale)
    with pytest.raises(ValueError, match="requirements"):
        assets.run("check")
