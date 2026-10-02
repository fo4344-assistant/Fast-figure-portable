#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DIST_DIR = ROOT / "dist"
INLINE_NAME = "Fast-figure.html"
SPLIT_ARCHIVE_NAME = "Fast-figure.zip"
SPLIT_ROOT = Path("Fast-figure")
README_SOURCE = ROOT / "README.md"
README_MARKER = b"<!-- FAST_FIGURE_README -->"

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
    (README_SOURCE, Path("README.md")),
    (ROOT / "LICENSE", Path("LICENSE")),
)

ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def _render_inline_markdown(text: str) -> str:
    rendered: list[str] = []
    index = 0
    while index < len(text):
        if text.startswith("`", index):
            end = text.find("`", index + 1)
            if end != -1:
                rendered.append(f"<code>{html.escape(text[index + 1:end])}</code>")
                index = end + 1
                continue
        if text.startswith("**", index):
            end = text.find("**", index + 2)
            if end != -1:
                rendered.append(
                    "<strong>"
                    + _render_inline_markdown(text[index + 2:end])
                    + "</strong>"
                )
                index = end + 2
                continue
        if text[index] == "[":
            label_end = text.find("](", index + 1)
            if label_end != -1:
                href_end = text.find(")", label_end + 2)
                if href_end != -1:
                    label = _render_inline_markdown(text[index + 1:label_end])
                    href = html.escape(text[label_end + 2:href_end], quote=True)
                    rendered.append(f'<a href="{href}">{label}</a>')
                    index = href_end + 1
                    continue
        rendered.append(html.escape(text[index]))
        index += 1
    return "".join(rendered)


def _starts_block(line: str) -> bool:
    stripped = line.lstrip()
    return (
        not stripped
        or stripped.startswith("```")
        or re.match(r"^#{1,6}\s+", stripped) is not None
        or re.match(r"^-\s+", stripped) is not None
        or re.match(r"^\d+\.\s+", stripped) is not None
    )


def render_readme_html(markdown: str) -> str:
    lines = markdown.splitlines()
    output = ['<div class="readme-content" data-source="README.md">']
    index = 0
    while index < len(lines):
        line = lines[index]
        stripped = line.strip()
        if not stripped:
            index += 1
            continue

        fence = re.match(r"^```([A-Za-z0-9_-]*)\s*$", stripped)
        if fence:
            language = fence.group(1)
            index += 1
            code_lines: list[str] = []
            while index < len(lines) and lines[index].strip() != "```":
                code_lines.append(lines[index])
                index += 1
            if index >= len(lines):
                raise RuntimeError("unterminated fenced code block in README.md")
            index += 1
            class_name = (
                f' class="language-{html.escape(language, quote=True)}"'
                if language
                else ""
            )
            output.append(
                f"<pre><code{class_name}>"
                + html.escape("\n".join(code_lines))
                + "</code></pre>"
            )
            continue

        heading = re.match(r"^(#{1,6})\s+(.+?)\s*$", stripped)
        if heading:
            level = len(heading.group(1))
            output.append(
                f"<h{level}>{_render_inline_markdown(heading.group(2))}</h{level}>"
            )
            index += 1
            continue

        unordered = re.match(r"^-\s+(.+)$", stripped)
        if unordered:
            output.append("<ul>")
            while index < len(lines):
                item = re.match(r"^-\s+(.+)$", lines[index].strip())
                if not item:
                    break
                output.append(f"<li>{_render_inline_markdown(item.group(1))}</li>")
                index += 1
            output.append("</ul>")
            continue

        ordered = re.match(r"^\d+\.\s+(.+)$", stripped)
        if ordered:
            output.append("<ol>")
            while index < len(lines):
                item = re.match(r"^\d+\.\s+(.+)$", lines[index].strip())
                if not item:
                    break
                output.append(f"<li>{_render_inline_markdown(item.group(1))}</li>")
                index += 1
            output.append("</ol>")
            continue

        paragraph = [stripped]
        index += 1
        while index < len(lines) and not _starts_block(lines[index]):
            paragraph.append(lines[index].strip())
            index += 1
        output.append(f"<p>{_render_inline_markdown(' '.join(paragraph))}</p>")

    output.append("</div>")
    return "\n".join(output)


def build_source_html() -> bytes:
    source = ROOT / "Fast-figure.html"
    if not source.is_file():
        raise FileNotFoundError(source)
    if not README_SOURCE.is_file():
        raise FileNotFoundError(README_SOURCE)

    document = source.read_bytes()
    if document.count(README_MARKER) != 1:
        raise RuntimeError("expected exactly one README build marker in Fast-figure.html")

    readme_html = render_readme_html(
        README_SOURCE.read_text(encoding="utf-8")
    ).encode("utf-8")
    return document.replace(README_MARKER, readme_html, 1)


def build_inline(output: Path) -> None:
    portable = build_source_html()
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

    built_html = build_source_html()
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(
        output,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as archive:
        for source, relative in SPLIT_FILES:
            content = built_html if relative == Path("Fast-figure.html") else source.read_bytes()
            archive.writestr(
                _zip_info(SPLIT_ROOT / relative),
                content,
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
