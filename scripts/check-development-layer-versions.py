#!/usr/bin/env python3
"""Validate Source Script > pseudocode > source code version precedence."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "development-versions.json"
SOURCE_SCRIPT_DIR = ROOT / "sourcescript"
PSEUDOCODE_DIR = ROOT / "pseudocode"
EXPECTED_PRECEDENCE = ["source-script", "pseudocode", "source-code"]


class VersionError(RuntimeError):
    pass


def git_blob_sha1(path: Path) -> str:
    data = path.read_bytes()
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def layer_fingerprint(paths: list[Path]) -> str:
    records = []
    for path in sorted(paths, key=lambda item: item.relative_to(ROOT).as_posix()):
        relative = path.relative_to(ROOT).as_posix()
        records.append(f"{relative}\0{git_blob_sha1(path)}\n")
    digest = hashlib.sha256("".join(records).encode("utf-8")).hexdigest()
    return f"sha256:{digest}"


def source_script_paths() -> list[Path]:
    if not SOURCE_SCRIPT_DIR.is_dir():
        raise VersionError("sourcescript directory is missing")
    paths = [
        path
        for path in SOURCE_SCRIPT_DIR.rglob("*.py")
        if path.is_file() and "__pycache__" not in path.parts
    ]
    if not paths:
        raise VersionError("no Source Script files found")
    return paths


def pseudocode_paths() -> list[Path]:
    if not PSEUDOCODE_DIR.is_dir():
        return []
    return [
        path
        for path in PSEUDOCODE_DIR.rglob("*")
        if path.is_file() and "__pycache__" not in path.parts
    ]


def source_code_paths(layer: dict) -> list[Path]:
    paths = []
    for relative in layer.get("paths", []):
        path = ROOT / relative
        if not path.is_file():
            raise VersionError(f"source-code file is missing: {relative}")
        paths.append(path)
    if not paths:
        raise VersionError("source-code paths are empty")
    return paths


def load_manifest(path: Path = MANIFEST_PATH) -> dict:
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise VersionError(f"version manifest is missing: {path.relative_to(ROOT)}") from error
    except json.JSONDecodeError as error:
        raise VersionError(f"invalid version manifest: {error}") from error
    if manifest.get("schema") != 1:
        raise VersionError("unsupported development version schema")
    if manifest.get("precedence") != EXPECTED_PRECEDENCE:
        raise VersionError(
            "development precedence must be source-script > pseudocode > source-code"
        )
    return manifest


def validate_current_tree(manifest: dict) -> dict[str, str | None]:
    layers = manifest.get("layers")
    if not isinstance(layers, dict):
        raise VersionError("layers object is missing")

    source = layers.get("source-script", {})
    pseudo = layers.get("pseudocode", {})
    code = layers.get("source-code", {})

    if source.get("status") != "current":
        raise VersionError("Source Script must always be the current authority layer")
    if not isinstance(source.get("revision"), int) or source["revision"] < 1:
        raise VersionError("source-script revision must be a positive integer")
    source_fp = layer_fingerprint(source_script_paths())
    if source.get("fingerprint") != source_fp:
        raise VersionError(
            "Source Script fingerprint changed without updating development-versions.json"
        )

    pseudo_paths = pseudocode_paths()
    pseudo_status = pseudo.get("status")
    pseudo_fp = None
    if pseudo_status == "missing":
        if pseudo_paths:
            raise VersionError(
                "pseudocode files exist but pseudocode layer is marked missing"
            )
        if pseudo.get("fingerprint") is not None:
            raise VersionError("missing pseudocode layer must not have a fingerprint")
    elif pseudo_status in {"stale", "current"}:
        if not pseudo_paths:
            raise VersionError(f"pseudocode layer is {pseudo_status} but has no files")
        pseudo_fp = layer_fingerprint(pseudo_paths)
        if pseudo.get("fingerprint") != pseudo_fp:
            raise VersionError(
                "pseudocode fingerprint changed without updating development-versions.json"
            )
        if pseudo_status == "current":
            if pseudo.get("derived_from", {}).get("source-script") != source_fp:
                raise VersionError(
                    "current pseudocode does not derive from the current Source Script"
                )
    else:
        raise VersionError(f"invalid pseudocode status: {pseudo_status!r}")

    code_status = code.get("status")
    if code_status not in {"stale", "current"}:
        raise VersionError(f"invalid source-code status: {code_status!r}")
    code_fp = layer_fingerprint(source_code_paths(code))
    if code.get("fingerprint") != code_fp:
        raise VersionError(
            "source-code fingerprint changed without updating development-versions.json"
        )
    if code_status == "current":
        if pseudo_status != "current" or pseudo_fp is None:
            raise VersionError("source code cannot be current before pseudocode is current")
        derived = code.get("derived_from", {})
        if derived.get("source-script") != source_fp:
            raise VersionError(
                "current source code does not derive from the current Source Script"
            )
        if derived.get("pseudocode") != pseudo_fp:
            raise VersionError(
                "current source code does not derive from the current pseudocode"
            )

    return {
        "source-script": source_fp,
        "pseudocode": pseudo_fp,
        "source-code": code_fp,
    }


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return result.stdout


def load_base_manifest(base: str) -> dict | None:
    try:
        text = git("show", f"{base}:development-versions.json")
    except subprocess.CalledProcessError:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError as error:
        raise VersionError(f"base development-versions.json is invalid: {error}") from error


def changed_paths(base: str) -> set[str]:
    output = git("diff", "--name-only", f"{base}..HEAD")
    return {line.strip() for line in output.splitlines() if line.strip()}


def path_exists_at_revision(revision: str, path: str) -> bool:
    result = subprocess.run(
        ["git", "cat-file", "-e", f"{revision}:{path}"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return result.returncode == 0


def validate_source_script_patch_record(changed: set[str], base: str) -> None:
    source_paths = sorted(
        path
        for path in changed
        if path.startswith("sourcescript/") and path.endswith(".py")
    )
    if not source_paths:
        return

    record_patches = sorted(
        path
        for path in changed
        if path.startswith("agent_space/patches/")
        and path.endswith(".patch")
        and not path_exists_at_revision(base, path)
    )
    if not record_patches:
        raise VersionError(
            "Source Script changed without a new agent_space/patches/*.patch record"
        )

    record_docs = {
        path
        for path in changed
        if path.startswith("agent_space/patches/")
        and path.endswith(".md")
        and not path_exists_at_revision(base, path)
    }
    for patch_path in record_patches:
        doc_path = patch_path.removesuffix(".patch") + ".md"
        if doc_path not in record_docs:
            raise VersionError(
                f"Source Script patch record has no paired explanation: {doc_path}"
            )

    combined_patch = "\n".join(
        (ROOT / patch_path).read_text(encoding="utf-8")
        for patch_path in record_patches
    )
    for source_path in source_paths:
        marker = f"diff --git a/{source_path} b/{source_path}"
        if marker not in combined_patch:
            raise VersionError(
                f"Source Script diff is missing from the new patch record: {source_path}"
            )

    if "development-versions.json" not in changed:
        raise VersionError(
            "Source Script changed without updating development-versions.json"
        )


def validate_revision_progression(manifest: dict, base: str) -> None:
    base_manifest = load_base_manifest(base)
    if base_manifest is None:
        return

    changed = changed_paths(base)
    current_layers = manifest["layers"]
    base_layers = base_manifest.get("layers", {})

    source_changed = any(
        path.startswith("sourcescript/") and path.endswith(".py")
        for path in changed
    )
    pseudo_changed = any(path.startswith("pseudocode/") for path in changed)

    source_paths = set(current_layers["source-code"].get("paths", []))
    source_paths.update(base_layers.get("source-code", {}).get("paths", []))
    code_changed = bool(changed & source_paths)

    def require_increment(layer_name: str) -> None:
        current_revision = current_layers[layer_name].get("revision")
        base_revision = base_layers.get(layer_name, {}).get("revision")
        if not isinstance(current_revision, int) or not isinstance(base_revision, int):
            raise VersionError(f"{layer_name} revision is not comparable")
        if current_revision <= base_revision:
            raise VersionError(
                f"{layer_name} changed without increasing its revision "
                f"({base_revision} -> {current_revision})"
            )

    if source_changed:
        require_increment("source-script")
        validate_source_script_patch_record(changed, base)

    if pseudo_changed:
        require_increment("pseudocode")
        if current_layers["pseudocode"].get("status") != "current":
            raise VersionError(
                "modified pseudocode must finish as current against the latest Source Script"
            )

    if code_changed:
        require_increment("source-code")
        if current_layers["pseudocode"].get("status") != "current":
            raise VersionError(
                "source code cannot change while pseudocode is missing or stale"
            )
        if current_layers["source-code"].get("status") != "current":
            raise VersionError(
                "modified source code must finish as current against the latest pseudocode"
            )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--base",
        help="optional git base revision used to enforce layer revision progression",
    )
    args = parser.parse_args()

    try:
        manifest = load_manifest()
        fingerprints = validate_current_tree(manifest)
        if args.base and set(args.base) != {"0"}:
            validate_revision_progression(manifest, args.base)
    except (VersionError, subprocess.CalledProcessError) as error:
        print(f"development-layer-version: FAIL: {error}", file=sys.stderr)
        return 1

    layers = manifest["layers"]
    print(
        "development-layer-version: PASS\n"
        f"  priority: {' > '.join(EXPECTED_PRECEDENCE)}\n"
        f"  source-script: r{layers['source-script']['revision']} "
        f"{layers['source-script']['status']} {fingerprints['source-script']}\n"
        f"  pseudocode: r{layers['pseudocode']['revision']} "
        f"{layers['pseudocode']['status']} {fingerprints['pseudocode'] or '-'}\n"
        f"  source-code: r{layers['source-code']['revision']} "
        f"{layers['source-code']['status']} {fingerprints['source-code']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
