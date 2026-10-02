#!/usr/bin/env python3
"""Run the in-page regression suite against both distribution artifacts."""

import base64
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile


class ResultParser(HTMLParser):
    encoded = None

    def handle_starttag(self, tag, attrs):
        if tag == "html":
            self.encoded = dict(attrs).get("data-fast-figure-regression")


def run(browser, source, probe):
    contents = source.read_text(encoding="utf-8")
    assert "</body>" in contents, source
    source.write_text(
        contents.replace("</body>", f"<script>{probe}</script>\n</body>", 1),
        encoding="utf-8",
    )
    completed = subprocess.run(
        [
            browser,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--allow-file-access-from-files",
            "--virtual-time-budget=20000",
            "--dump-dom",
            source.as_uri(),
        ],
        capture_output=True,
        text=True,
        timeout=90,
    )
    parser = ResultParser()
    parser.feed(completed.stdout)
    if not parser.encoded:
        raise RuntimeError(
            f"Regression did not finish on {source}: " + completed.stderr[-2500:]
        )
    return json.loads(
        base64.b64decode(html.unescape(parser.encoded)).decode("utf-8")
    )


def main():
    root = Path(__file__).resolve().parents[2]
    browser = shutil.which("google-chrome") or shutil.which("chromium")
    if not browser:
        raise SystemExit("Chrome/Chromium is required")

    probe = (root / "agent_space/tests/browser-regression.js").read_text(
        encoding="utf-8"
    )

    with tempfile.TemporaryDirectory(prefix="fast-figure-regression-") as temp:
        base = Path(temp)
        dist = base / "dist"
        subprocess.run(
            [
                sys.executable,
                str(root / "scripts/build-portable.py"),
                "--dist-dir",
                str(dist),
            ],
            check=True,
        )

        inline = dist / "inline" / "Fast-figure.html"
        split_zip = dist / "split" / "Fast-figure.zip"
        if not inline.is_file() or not split_zip.is_file():
            raise RuntimeError("distribution builder did not create both artifacts")

        expected_members = {
            "Fast-figure/Fast-figure.html",
            "Fast-figure/fast-figure.js",
            "Fast-figure/fast-figure-ui.js",
            "Fast-figure/vendor/plotly.min.js",
            "Fast-figure/vendor/fast-figure-ui-runtime.js",
            "Fast-figure/README.md",
            "Fast-figure/LICENSE",
        }
        extracted = base / "split-package"
        with zipfile.ZipFile(split_zip) as archive:
            members = set(archive.namelist())
            if members != expected_members:
                raise RuntimeError(
                    "unexpected split package members: "
                    + repr(sorted(members ^ expected_members))
                )
            if archive.read("Fast-figure/README.md") != (root / "README.md").read_bytes():
                raise RuntimeError(
                    "split package README.md differs from repository README.md"
                )
            archive.extractall(extracted)

        split = extracted / "Fast-figure" / "Fast-figure.html"
        for name, target in (("inline", inline), ("split-zip", split)):
            contents = target.read_text(encoding="utf-8")
            if "<!-- FAST_FIGURE_README -->" in contents:
                raise RuntimeError(f"{name} HTML still contains the README build marker")
            if 'data-source="README.md"' not in contents or "<h1>Fast Figure</h1>" not in contents:
                raise RuntimeError(f"{name} HTML does not contain the built README.md content")

        failed = False
        for name, target in (("inline", inline), ("split-zip", split)):
            results = run(browser, target, probe)
            print(f"\n{name} file:// regression:", flush=True)
            for item in results:
                print(f"{item['number']:>2}. {item['result']:>7}  {item['name']}")
                if item.get("detail"):
                    print(f"    {item['detail'][:1200]}")
                failed |= item["result"] == "fail"
            print(flush=True)

        print(
            f"distribution artifacts: inline={inline.stat().st_size} bytes, "
            f"split-zip={split_zip.stat().st_size} bytes",
            flush=True,
        )
        if failed:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
