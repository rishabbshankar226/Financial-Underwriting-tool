"""Prepare and verify the generated, public Streamlit component bundle."""

import argparse
import hashlib
import json
from collections.abc import Mapping
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "streamlit_app/component/spreadline_workspace/frontend/build"
REQUIREMENTS = ROOT / "streamlit_app/requirements.txt"
# Hosted environments reinstall dependencies only when the requirements file changes, and the
# packaged component keeps its built assets inside its installed copy. Stamping the bundle into
# the requirements file makes every new bundle a dependency change, so hosts reinstall it.
STAMP = "# component-bundle: "


def source_hash() -> str:
    paths = [p for p in (ROOT / "frontend/src").rglob("*") if p.is_file()]
    paths.extend(
        ROOT / p
        for p in (
            "frontend/package.json",
            "frontend/package-lock.json",
            "frontend/tsconfig.json",
            "frontend/vite.streamlit.config.ts",
            "streamlit_app/component/pyproject.toml",
            "streamlit_app/component/spreadline_workspace/pyproject.toml",
            "streamlit_app/component/spreadline_workspace/__init__.py",
        )
    )
    digest = hashlib.sha256()
    for path in sorted(paths):
        digest.update(path.relative_to(ROOT).as_posix().encode() + b"\0" + path.read_bytes())
    return digest.hexdigest()


def manifest() -> dict[str, str | int]:
    bundles = list(BUILD.glob("index-*.js"))
    if len(bundles) != 1:
        raise ValueError("Exactly one generated JavaScript entry is required")
    bundle = bundles[0]
    return {
        "version": 1,
        "source_sha256": source_hash(),
        "bundle": bundle.name,
        "bundle_sha256": hashlib.sha256(bundle.read_bytes()).hexdigest(),
    }


def stamped_requirements(text: str, entry: Mapping[str, str | int]) -> str:
    """The requirements text with exactly one final stamp line naming this bundle."""
    lines = [line for line in text.splitlines() if not line.startswith(STAMP)]
    return "\n".join([*lines, f"{STAMP}{entry['bundle']} {entry['bundle_sha256']}"]) + "\n"


def run(action: str) -> None:
    if action == "prepare":
        BUILD.mkdir(parents=True, exist_ok=True)
        # This directory contains generated public files only. Remove stale entries
        # explicitly, including when a bundler does not clean an external outDir.
        for path in BUILD.iterdir():
            if not path.is_file() or path.is_symlink():
                raise ValueError("Unexpected entry in the generated component directory")
            path.unlink()
    elif action == "write":
        current = manifest()
        (BUILD / "manifest.json").write_text(json.dumps(current, indent=2) + "\n", encoding="utf-8")
        requirements = REQUIREMENTS.read_text(encoding="utf-8")
        REQUIREMENTS.write_text(stamped_requirements(requirements, current), encoding="utf-8")
    else:
        expected = manifest()
        if json.loads((BUILD / "manifest.json").read_text(encoding="utf-8")) != expected:
            raise ValueError("Component assets are stale; rebuild the Streamlit component")
        if {p.name for p in BUILD.iterdir()} != {"manifest.json", expected["bundle"]}:
            raise ValueError("Unexpected files in public component assets")
        requirements = REQUIREMENTS.read_text(encoding="utf-8")
        if requirements != stamped_requirements(requirements, expected):
            raise ValueError("The requirements bundle stamp is stale; rebuild the Streamlit component")
        print("Streamlit component assets match their source, manifest and requirements stamp.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("prepare", "write", "check"))
    run(parser.parse_args().action)
