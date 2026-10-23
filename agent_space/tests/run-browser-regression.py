#!/usr/bin/env python3
"""Run the in-page regression suite against both distribution artifacts."""

import base64
import json
import os
import select
import time
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile


def run(browser, source, probe):
    contents = source.read_text(encoding="utf-8")
    assert "</body>" in contents, source
    source.write_text(
        contents.replace("</body>", f"<script>{probe}</script>\n</body>", 1),
        encoding="utf-8",
    )
    # Default Actions runners are POSIX. Chrome's CDP pipe uses fd3/fd4;
    # poll the actual completion marker instead of dumping DOM on virtual time.
    deadline = time.monotonic() + 90
    browser_input, writer = os.pipe()
    reader, browser_output = os.pipe()
    with tempfile.TemporaryFile() as errors:
        bootstrap = (
            "import os,sys; a,b=int(sys.argv[1]),int(sys.argv[2]); "
            "os.dup2(a,3); os.dup2(b,4); "
            "os.execv(sys.argv[3],sys.argv[3:])"
        )
        try:
            process = subprocess.Popen(
                [sys.executable, "-c", bootstrap, str(browser_input), str(browser_output),
                 browser, "--headless=new", "--no-sandbox", "--disable-gpu",
                 "--allow-file-access-from-files", "--remote-debugging-pipe", "about:blank"],
                pass_fds=(browser_input, browser_output),
                stdout=subprocess.DEVNULL, stderr=errors,
            )
        finally:
            os.close(browser_input)
            os.close(browser_output)
        pending = b""
        sequence = 0

        def command(method, params=None, session=None):
            nonlocal pending, sequence
            sequence += 1
            request = {"id": sequence, "method": method, "params": params or {}}
            if session:
                request["sessionId"] = session
            os.write(writer, json.dumps(request).encode() + b"\0")
            while time.monotonic() < deadline:
                while b"\0" in pending:
                    packet, pending = pending.split(b"\0", 1)
                    response = json.loads(packet)
                    if response.get("id") == sequence:
                        if "error" in response:
                            raise RuntimeError(f"CDP {method}: {response['error']}")
                        return response["result"]
                ready, _, _ = select.select([reader], [], [], max(0, deadline - time.monotonic()))
                if ready:
                    chunk = os.read(reader, 65536)
                    if not chunk:
                        raise RuntimeError("Chrome CDP pipe closed before regression completion")
                    pending += chunk
            raise TimeoutError("90-second regression wall deadline expired")

        snapshot = {}
        try:
            target = command("Target.createTarget", {"url": "about:blank"})["targetId"]
            session = command("Target.attachToTarget", {"targetId": target, "flatten": True})["sessionId"]
            navigation = command("Page.navigate", {"url": source.as_uri()}, session)
            if navigation.get("errorText"):
                raise RuntimeError(f"Chrome navigation: {navigation['errorText']}")
            expression = (
                "document.documentElement && JSON.stringify({"
                "encoded:document.documentElement.getAttribute('data-fast-figure-regression'),"
                "progress:document.documentElement.getAttribute('data-fast-figure-regression-progress')})"
            )
            while time.monotonic() < deadline:
                reply = command("Runtime.evaluate", {"expression": expression, "returnByValue": True}, session)
                if reply.get("exceptionDetails"):
                    raise RuntimeError(f"Regression marker read failed: {reply['exceptionDetails']}")
                value = reply.get("result", {}).get("value")
                if value:
                    snapshot = json.loads(value)
                    if snapshot.get("encoded"):
                        return json.loads(base64.b64decode(snapshot["encoded"]).decode("utf-8"))
                time.sleep(0.05)
            raise TimeoutError("90-second regression wall deadline expired")
        except Exception as error:
            errors.seek(0)
            stderr = errors.read().decode("utf-8", errors="replace")[-2500:]
            raise RuntimeError(
                f"Regression did not finish on {source}: returncode={process.poll()}; "
                f"last-progress={snapshot.get('progress')!r}; cause={error}; stderr={stderr}"
            ) from error
        finally:
            os.close(writer)
            os.close(reader)
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


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
