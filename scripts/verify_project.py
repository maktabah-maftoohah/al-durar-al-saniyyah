"""Comprehensive project and zero-build verification for al-durar-al-saniyyah."""
import json
import re
from pathlib import Path

def test_project():
    root = Path(__file__).resolve().parent.parent

    # Required files
    required_files = [
        "index.html",
        "404.html",
        ".nojekyll",
        ".gitignore",
        ".gitattributes",
        "package.json",
        "AGENTS.md",
        "README.md",
        "robots.txt",
        "sitemap.xml",
        "manifest.webmanifest",
        "sw.js",
        "icon.svg",
        "css/main.css",
        "js/app.js",
        "data/collection.json",
    ]

    for rel in required_files:
        p = root / rel
        assert p.exists(), f"Missing required file: {rel}"
        if rel != ".nojekyll":
            assert p.stat().st_size > 0, f"File is empty: {rel}"

    # UTF-8 without BOM check
    for p in root.rglob("*"):
        if p.is_file() and p.suffix in [".html", ".css", ".js", ".json", ".md", ".py", ".xml", ".txt"]:
            if ".git" in p.parts:
                continue
            content_bytes = p.read_bytes()
            assert not content_bytes.startswith(b"\xef\xbb\xbf"), f"BOM detected in {p.relative_to(root)}"

    # Invariant 1: GitHub Pages subpath compatibility (No absolute root assets like /data/ or /css/)
    html_content = (root / "index.html").read_text(encoding="utf-8")
    assert 'href="/' not in html_content, "Absolute root path href detected in index.html"
    assert 'src="/' not in html_content, "Absolute root path src detected in index.html"

    # Invariant 7: No links to github.com repository
    assert "github.com/maktabah-maftoohah/al-durar-al-saniyyah" not in html_content, "Found forbidden repository link in index.html per Invariant #7"

    # Verify manifest JSON
    with open(root / "manifest.webmanifest", "r", encoding="utf-8") as f:
        manifest = json.load(f)
        assert manifest.get("short_name"), "manifest.webmanifest missing short_name"
        assert manifest.get("icons"), "manifest.webmanifest missing icons"

    # Verify collection JSON
    with open(root / "data" / "collection.json", "r", encoding="utf-8") as f:
        collection = json.load(f)
        assert len(collection.get("volumes", [])) == 16, "Must catalogue exactly 16 volumes"
        assert len(collection.get("treatises", [])) >= 1, "Must contain at least 1 treatise"

    print("Project structure and invariant verification PASSED for al-durar-al-saniyyah.")

if __name__ == "__main__":
    test_project()