#!/usr/bin/env python3
"""Structural and packaging checks for the modular source/classic bundle boundary."""
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("portable", ROOT / "scripts/build-portable.py")
portable = importlib.util.module_from_spec(spec)
spec.loader.exec_module(portable)


class ModuleBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.before = {p: p.read_bytes() for p in (ROOT / "sourcecode").rglob("*") if p.is_file()}
        cls.runtime = portable.bundle_runtime()

    def test_runtime_is_deterministic_and_classic_script(self):
        self.assertEqual(self.runtime, portable.bundle_runtime())
        subprocess.run(["node", "--check", "--input-type=commonjs"], input=self.runtime, check=True)
        self.assertNotRegex(self.runtime.decode("utf-8"), r"(?m)^\s*(?:import|export)\s")

    def test_modules_have_explicit_resolvable_imports(self):
        modules = sorted((ROOT / "sourcecode").rglob("*.js"))
        self.assertEqual(len(modules), 15)
        self.assertFalse((ROOT / "sourcecode/fast-figure.js").exists())
        self.assertFalse((ROOT / "sourcecode/fast-figure-ui.js").exists())
        for module in modules:
            text = module.read_text(encoding="utf-8")
            self.assertRegex(text, r"(?m)^export ")
            for reference in re.findall(r"(?m)^import .*? from ['\"]([^'\"]+)['\"];", text):
                self.assertTrue(reference.startswith("."), (module, reference))
                self.assertTrue((module.parent / reference).is_file(), (module, reference))
            self.assertNotRegex(text, r"\b(?:eval|require)\s*\(")

    def test_lineage_covers_every_source_and_build_dependency(self):
        metadata = json.loads((ROOT / "development-versions.json").read_text(encoding="utf-8"))
        paths = set(metadata["layers"]["source-code"]["paths"])
        expected = {p.relative_to(ROOT).as_posix() for p in self.before}
        expected.update({"scripts/build-portable.py", "package.json", "package-lock.json"})
        self.assertEqual(paths, expected)

    def test_both_distributions_share_runtime_without_changing_source(self):
        with tempfile.TemporaryDirectory(prefix="fast-figure-module-test-") as temp:
            inline, split = Path(temp) / "Fast-figure.html", Path(temp) / "Fast-figure.zip"
            portable.build_inline(inline, self.runtime)
            portable.build_split_zip(split, self.runtime)
            document = inline.read_bytes()
            escaped_runtime = re.sub(rb"</script", b"<\\\\/script", self.runtime, flags=re.IGNORECASE)
            self.assertIn(escaped_runtime, document)
            self.assertNotIn(b'<script src="./fast-figure.js">', document)
            self.assertNotIn(b'fast-figure-ui.js', document)
            with zipfile.ZipFile(split) as archive:
                self.assertEqual(set(archive.namelist()), {
                    "Fast-figure/Fast-figure.html", "Fast-figure/fast-figure.js",
                    "Fast-figure/vendor/plotly.min.js", "Fast-figure/vendor/fast-figure-ui-runtime.js",
                    "Fast-figure/README.md", "Fast-figure/LICENSE",
                })
                self.assertEqual(archive.read("Fast-figure/fast-figure.js"), self.runtime)
                self.assertEqual(archive.read("Fast-figure/Fast-figure.html").count(b'<script src="./fast-figure.js">'), 1)
                self.assertNotIn(b'fast-figure-ui.js', archive.read("Fast-figure/Fast-figure.html"))
        after = {p: p.read_bytes() for p in (ROOT / "sourcecode").rglob("*") if p.is_file()}
        self.assertEqual(self.before, after)


if __name__ == "__main__":
    unittest.main()
