#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "dist" / "Fast-figure.html"
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


def build(output: Path) -> None:
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the byte-equivalent single-file Fast Figure HTML from split source."
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output.resolve())
