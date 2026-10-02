#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DIST_DIR = ROOT / "dist"
INLINE_NAME = "Fast-figure.html"
SPLIT_ARCHIVE_NAME = "Fast-figure.zip"
SPLIT_ROOT = Path("Fast-figure")

SCRIPTS = (
    (
        b'<script src="./vendor/plotly.min.js"></script>',
        ROOT / "vendor" / "plotly.min.js",
        b'<script>',
    ),
    (
        b'<script id="ff-mantine-runtime" src="./vendor/fast-figure-ui-runtime.js"></script>',
        ROOT / "vendor" / "fast-figure-ui-runtime.js",
        b'<script id="ff-mantine-runtime">',
    ),
    (
        b'<script src="./fast-figure.js"></script>',
        ROOT / "fast-figure.js",
        b'<script>',
    ),
    (
        b'<script src="./fast-figure-ui.js"></script>',
        ROOT / "fast-figure-ui.js",
        b'<script>',
    ),
)

SPLIT_FILES = (
    (ROOT / "Fast-figure.html", Path("Fast-figure.html")),
    (ROOT / "fast-figure.js", Path("fast-figure.js")),
    (ROOT / "fast-figure-ui.js", Path("fast-figure-ui.js")),
    (ROOT / "vendor" / "plotly.min.js", Path("vendor/plotly.min.js")),
    (
        ROOT / "vendor" / "fast-figure-ui-runtime.js",
        Path("vendor/fast-figure-ui-runtime.js"),
    ),
    (ROOT / "README.md", Path("README.md")),
    (ROOT / "LICENSE", Path("LICENSE")),
)

ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def build_inline(output: Path) -> None:
    portable = (ROOT / "Fast-figure.html").read_bytes()
    for tag, source, open_tag in SCRIPTS:
        if portable.count(tag) != 1:
            raise RuntimeError(f"expected exactly one external script tag: {tag!r}")
        if not source.is_file():
            raise FileNotFoundError(source)
        portable = portable.replace(
            tag,
            open_tag + source.read_bytes() + b"</script>",
            1,
        )
    for tag, _, _ in SCRIPTS:
        if tag in portable:
            raise RuntimeError(f"external script tag remains: {tag!r}")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(portable)


def _zip_info(path: Path) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(path.as_posix(), ZIP_TIMESTAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    return info


def build_split_zip(output: Path) -> None:
    for source, _ in SPLIT_FILES:
        if not source.is_file():
            raise FileNotFoundError(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(
        output,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as archive:
        for source, relative in SPLIT_FILES:
            archive.writestr(
                _zip_info(SPLIT_ROOT / relative),
                source.read_bytes(),
                compress_type=zipfile.ZIP_DEFLATED,
                compresslevel=9,
            )


def build_distribution(
    dist_dir: Path,
    inline_output: Path | None = None,
    zip_output: Path | None = None,
) -> tuple[Path, Path]:
    inline = inline_output or dist_dir / "inline" / INLINE_NAME
    split_zip = zip_output or dist_dir / "split" / SPLIT_ARCHIVE_NAME
    build_inline(inline)
    build_split_zip(split_zip)
    return inline, split_zip


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Build Fast Figure distribution artifacts: a single-file inline HTML "
            "and a split-source ZIP package."
        )
    )
    parser.add_argument(
        "--dist-dir",
        type=Path,
        default=DEFAULT_DIST_DIR,
        help="distribution root (default: ./dist)",
    )
    parser.add_argument(
        "--inline-output",
        "--output",
        dest="inline_output",
        type=Path,
        default=None,
        help="override the single-file HTML output path",
    )
    parser.add_argument(
        "--zip-output",
        type=Path,
        default=None,
        help="override the split ZIP output path",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build_distribution(
        args.dist_dir.resolve(),
        args.inline_output.resolve() if args.inline_output else None,
        args.zip_output.resolve() if args.zip_output else None,
    )
