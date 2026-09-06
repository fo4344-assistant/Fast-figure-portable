#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "dist" / "Fast-figure.html"
SCRIPTS = (
    (
        '<script src="./vendor/plotly.min.js"></script>',
        ROOT / "vendor" / "plotly.min.js",
        "<script>{body}</script>",
    ),
    (
        '<script id="ff-mantine-runtime" src="./vendor/fast-figure-ui-runtime.js"></script>',
        ROOT / "vendor" / "fast-figure-ui-runtime.js",
        '<script id="ff-mantine-runtime">{body}</script>',
    ),
    (
        '<script src="./fast-figure.js"></script>',
        ROOT / "fast-figure.js",
        "<script>{body}</script>",
    ),
)


def embed_script(html: str, tag: str, source: Path, template: str) -> str:
    if html.count(tag) != 1:
        raise RuntimeError(f"expected exactly one script tag: {tag}")
    body = source.read_text(encoding="utf-8")
    return html.replace(tag, template.format(body=body), 1)


def build(output: Path) -> None:
    source_html = (ROOT / "Fast-figure.html").read_text(encoding="utf-8")
    portable = source_html
    for tag, source, template in SCRIPTS:
        if not source.is_file():
            raise FileNotFoundError(source)
        portable = embed_script(portable, tag, source, template)

    for tag, _, _ in SCRIPTS:
        if tag in portable:
            raise RuntimeError(f"external script tag remains in portable build: {tag}")
    if "const PACKAGE_FORMAT_VERSION" not in portable:
        raise RuntimeError("Fast Figure application source was not embedded")
    if "Plotly.setPlotConfig" not in portable:
        raise RuntimeError("Plotly bootstrap is missing from portable build")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(portable, encoding="utf-8")
    payload = output.read_bytes()
    print(
        f"built {output}: bytes={len(payload)} "
        f"sha256={hashlib.sha256(payload).hexdigest()}"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the single-file Fast Figure portable HTML from split development source."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="output HTML path (default: dist/Fast-figure.html)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    build(args.output.resolve())
