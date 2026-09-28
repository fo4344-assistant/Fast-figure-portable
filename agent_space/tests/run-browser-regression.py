#!/usr/bin/env python3
"""Run the in-page regression suite against split and portable file URLs."""

import base64
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


class ResultParser(HTMLParser):
    encoded = None

    def handle_starttag(self, tag, attrs):
        if tag == "html":
            self.encoded = dict(attrs).get("data-fast-figure-regression")


def run(browser, source, probe):
    contents = source.read_text(encoding="utf-8")
    assert "</body>" in contents, source
    source.write_text(contents.replace("</body>", f"<script>{probe}</script>\n</body>", 1), encoding="utf-8")
    completed = subprocess.run(
        [browser, "--headless=new", "--no-sandbox", "--disable-gpu",
         "--allow-file-access-from-files", "--virtual-time-budget=20000",
         "--dump-dom", source.as_uri()],
        capture_output=True, text=True, timeout=90,
    )
    parser = ResultParser()
    parser.feed(completed.stdout)
    if not parser.encoded:
        raise RuntimeError(f"Regression did not finish on {source}: " + completed.stderr[-2500:])
    return json.loads(base64.b64decode(html.unescape(parser.encoded)).decode("utf-8"))


def main():
    root = Path(__file__).resolve().parents[2]
    browser = shutil.which("google-chrome") or shutil.which("chromium")
    if not browser:
        raise SystemExit("Chrome/Chromium is required")
    probe = (root / "agent_space/tests/browser-regression.js").read_text(encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="fast-figure-regression-") as temp:
        base = Path(temp)
        split = base / "split"
        (split / "vendor").mkdir(parents=True)
        for name in ("Fast-figure.html", "fast-figure.js", "fast-figure-ui.js"):
            shutil.copy2(root / name, split / name)
        for name in ("plotly.min.js", "fast-figure-ui-runtime.js"):
            shutil.copy2(root / "vendor" / name, split / "vendor" / name)
        portable = base / "portable" / "Fast-figure.html"
        portable.parent.mkdir()
        subprocess.run([sys.executable, str(root / "scripts/build-portable.py"),
                        "--output", str(portable)], check=True)
        failed = False
        for name, target in (("split", split / "Fast-figure.html"), ("portable", portable)):
            results = run(browser, target, probe)
            print(f"\n{name} file:// regression:", flush=True)
            for item in results:
                print(f"{item['number']:>2}. {item['result']:>7}  {item['name']}")
                if item.get("detail"):
                    print(f"    {item['detail'][:1200]}")
                failed |= item["result"] == "fail"
            print(flush=True)
        if failed:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
