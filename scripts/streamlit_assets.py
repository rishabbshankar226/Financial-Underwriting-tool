"""Prepare and verify the generated, public Streamlit component bundle."""

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "streamlit_app/component/spreadline_workspace/frontend/build"


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
        (BUILD / "manifest.json").write_text(json.dumps(manifest(), indent=2) + "\n", encoding="utf-8")
    else:
        if json.loads((BUILD / "manifest.json").read_text(encoding="utf-8")) != manifest():
            raise ValueError("Component assets are stale; rebuild the Streamlit component")
        if {p.name for p in BUILD.iterdir()} != {"manifest.json", manifest()["bundle"]}:
            raise ValueError("Unexpected files in public component assets")
        print("Streamlit component assets match their source and manifest.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("prepare", "write", "check"))
    run(parser.parse_args().action)
