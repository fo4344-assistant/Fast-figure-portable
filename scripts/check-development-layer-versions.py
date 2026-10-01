#!/usr/bin/env python3
"""Validate Source Script > verification model/TLC > source code lineage."""

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
VERIFICATION_DIR = ROOT / "verification"
PSEUDOCODE_DIR = ROOT / "pseudocode"
EXPECTED_PRECEDENCE = ["source-script", "verification-model", "source-code"]


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


def verification_model_paths() -> list[Path]:
    if not VERIFICATION_DIR.is_dir():
        return []
    return [
        path
        for path in VERIFICATION_DIR.rglob("*")
        if path.is_file() and "__pycache__" not in path.parts
    ]


def legacy_pseudocode_paths() -> list[Path]:
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
    if manifest.get("schema") != 2:
        raise VersionError("unsupported development version schema")
    if manifest.get("precedence") != EXPECTED_PRECEDENCE:
        raise VersionError(
            "development precedence must be source-script > verification-model > source-code"
        )
    return manifest


def validate_review_path(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.startswith("agent_space/reviews/"):
        raise VersionError(f"{label} must name an agent_space/reviews/ file")
    if not (ROOT / value).is_file():
        raise VersionError(f"{label} is missing: {value}")
    return value


def validate_current_tree(manifest: dict) -> dict[str, str | None]:
    layers = manifest.get("layers")
    if not isinstance(layers, dict):
        raise VersionError("layers object is missing")

    source = layers.get("source-script", {})
    verification = layers.get("verification-model", {})
    code = layers.get("source-code", {})

    if source.get("status") != "current":
        raise VersionError("Source Script must always be the current authority layer")
    if not isinstance(source.get("revision"), int) or source["revision"] < 1:
        raise VersionError("source-script revision must be a positive integer")
    source_closure = source.get("closure")
    if source_closure not in {"open", "closed"}:
        raise VersionError("source-script closure must be open or closed")
    closure_review = source.get("closure_review")
    if source_closure == "closed":
        validate_review_path(closure_review, "Source Script closure review")
    elif closure_review is not None:
        raise VersionError("open Source Script must not name a closure review")

    source_fp = layer_fingerprint(source_script_paths())
    if source.get("fingerprint") != source_fp:
        raise VersionError(
            "Source Script fingerprint changed without updating development-versions.json"
        )

    verification_paths = verification_model_paths()
    verification_status = verification.get("status")
    tlc_status = verification.get("tlc")
    if tlc_status not in {"pending", "passed"}:
        raise VersionError("verification-model tlc must be pending or passed")

    verification_fp = None
    if verification_status == "missing":
        if verification_paths:
            raise VersionError(
                "verification files exist but verification-model is marked missing"
            )
        if verification.get("fingerprint") is not None:
            raise VersionError("missing verification-model must not have a fingerprint")
        if verification.get("revision") != 0:
            raise VersionError("missing verification-model must have revision 0")
        if verification.get("derived_from", {}).get("source-script") is not None:
            raise VersionError(
                "missing verification-model must not record a Source Script derivation"
            )
        if tlc_status != "pending":
            raise VersionError("missing verification-model must have pending TLC status")
        if verification.get("validation_review") is not None:
            raise VersionError("missing verification-model must not name a validation review")
    elif verification_status in {"stale", "current"}:
        if not isinstance(verification.get("revision"), int) or verification["revision"] < 1:
            raise VersionError("verification-model revision must be a positive integer")
        if not verification_paths:
            raise VersionError(
                f"verification-model is {verification_status} but has no files"
            )
        verification_fp = layer_fingerprint(verification_paths)
        if verification.get("fingerprint") != verification_fp:
            raise VersionError(
                "verification-model fingerprint changed without updating development-versions.json"
            )
        if verification_status == "current":
            if source_closure != "closed":
                raise VersionError(
                    "verification-model cannot be current before Source Script is closed"
                )
            if verification.get("derived_from", {}).get("source-script") != source_fp:
                raise VersionError(
                    "current verification-model does not derive from the current Source Script"
                )
        if tlc_status == "passed":
            if verification_status != "current":
                raise VersionError("TLC cannot be passed for a stale verification-model")
            validate_review_path(
                verification.get("validation_review"),
                "verification-model validation review",
            )
        elif verification.get("validation_review") is not None:
            raise VersionError(
                "pending verification-model must not name a validation review"
            )
    else:
        raise VersionError(f"invalid verification-model status: {verification_status!r}")

    legacy = manifest.get("legacy_artifacts", {}).get("pseudocode")
    if legacy is not None:
        legacy_paths = legacy_pseudocode_paths()
        if legacy.get("status") != "archived":
            raise VersionError("legacy pseudocode artifact must be marked archived")
        if not legacy_paths:
            raise VersionError("legacy pseudocode artifact is recorded but files are missing")
        legacy_fp = layer_fingerprint(legacy_paths)
        if legacy.get("fingerprint") != legacy_fp:
            raise VersionError(
                "archived pseudocode changed; update or restore the explicit legacy record"
            )

    code_status = code.get("status")
    if code_status not in {"stale", "current"}:
        raise VersionError(f"invalid source-code status: {code_status!r}")
    code_fp = layer_fingerprint(source_code_paths(code))
    if code.get("fingerprint") != code_fp:
        raise VersionError(
            "source-code fingerprint changed without updating development-versions.json"
        )
    if code_status == "current":
        if verification_status != "current" or verification_fp is None:
            raise VersionError(
                "source code cannot be current before verification-model is current"
            )
        if tlc_status != "passed":
            raise VersionError(
                "source code cannot be current before TLC validation passes"
            )
        derived = code.get("derived_from", {})
        if derived.get("source-script") != source_fp:
            raise VersionError(
                "current source code does not derive from the current Source Script"
            )
        if derived.get("verification-model") != verification_fp:
            raise VersionError(
                "current source code does not derive from the current verification-model"
            )

    return {
        "source-script": source_fp,
        "verification-model": verification_fp,
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
    verification_changed = any(path.startswith("verification/") for path in changed)

    source_paths = set(current_layers["source-code"].get("paths", []))
    source_paths.update(base_layers.get("source-code", {}).get("paths", []))
    code_changed = bool(changed & source_paths)

    def require_increment(layer_name: str) -> None:
        current_revision = current_layers[layer_name].get("revision")
        base_revision = base_layers.get(layer_name, {}).get("revision")
        if not isinstance(current_revision, int):
            raise VersionError(f"{layer_name} current revision is not comparable")
        if not isinstance(base_revision, int):
            if base_manifest.get("schema") == 1 and layer_name == "verification-model":
                base_revision = 0
            else:
                raise VersionError(f"{layer_name} base revision is not comparable")
        if current_revision <= base_revision:
            raise VersionError(
                f"{layer_name} changed without increasing its revision "
                f"({base_revision} -> {current_revision})"
            )

    if source_changed:
        require_increment("source-script")
        validate_source_script_patch_record(changed, base)

    base_source = base_layers.get("source-script", {})
    if (
        base_source.get("closure") != "closed"
        and current_layers["source-script"].get("closure") == "closed"
    ):
        review_path = current_layers["source-script"].get("closure_review")
        if not isinstance(review_path, str) or review_path not in changed:
            raise VersionError(
                "closing Source Script requires a newly changed closure review"
            )
        if path_exists_at_revision(base, review_path):
            raise VersionError(
                "Source Script closure review must be new for this closure transition"
            )

    if verification_changed:
        require_increment("verification-model")
        verification = current_layers["verification-model"]
        if verification.get("status") != "current":
            raise VersionError(
                "modified verification-model must finish as current against the latest Source Script"
            )
        if current_layers["source-script"].get("closure") != "closed":
            raise VersionError(
                "verification-model cannot change before Source Script is closed"
            )

    base_verification = base_layers.get("verification-model", {})
    current_verification = current_layers.get("verification-model", {})
    if (
        base_verification.get("tlc") != "passed"
        and current_verification.get("tlc") == "passed"
    ):
        review_path = current_verification.get("validation_review")
        if not isinstance(review_path, str) or review_path not in changed:
            raise VersionError(
                "passing TLC validation requires a newly changed validation review"
            )
        if path_exists_at_revision(base, review_path):
            raise VersionError(
                "TLC validation review must be new for this validation transition"
            )

    if code_changed:
        require_increment("source-code")
        verification = current_layers["verification-model"]
        if verification.get("status") != "current":
            raise VersionError(
                "source code cannot change while verification-model is missing or stale"
            )
        if verification.get("tlc") != "passed":
            raise VersionError(
                "source code cannot change before TLC validation passes"
            )
        if current_layers["source-code"].get("status") != "current":
            raise VersionError(
                "modified source code must finish as current against the latest verification-model"
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
        f"{layers['source-script']['status']}/{layers['source-script']['closure']} "
        f"{fingerprints['source-script']}\n"
        f"  verification-model: r{layers['verification-model']['revision']} "
        f"{layers['verification-model']['status']}/{layers['verification-model']['tlc']} "
        f"{fingerprints['verification-model'] or '-'}\n"
        f"  source-code: r{layers['source-code']['revision']} "
        f"{layers['source-code']['status']} {fingerprints['source-code']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
