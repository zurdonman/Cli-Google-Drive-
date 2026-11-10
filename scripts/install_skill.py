#!/usr/bin/env python3
"""Install this repository's Agent Skill into a harness skills directory."""

import argparse
import json
from pathlib import Path
import shutil


def main():
    parser = argparse.ArgumentParser(description="Instala la skill google-drive en un harness compatible con Agent Skills.")
    parser.add_argument("--target", type=Path, default=Path(".agents/skills"), help="Directorio de skills (por defecto: .agents/skills)")
    args = parser.parse_args()
    repository = Path(__file__).resolve().parent.parent
    source = repository / "skills" / "google-drive"
    destination = args.target.expanduser().resolve() / "google-drive"
    if destination.exists():
        raise SystemExit(f"Ya existe {destination}; elimínala o actualízala explícitamente antes de reinstalar.")
    destination.mkdir(parents=True)
    shutil.copy2(source / "SKILL.md", destination / "SKILL.md")
    shutil.copytree(repository / "scripts", destination / "scripts", ignore=shutil.ignore_patterns("__pycache__"))
    print(json.dumps({"ok": True, "skill": "google-drive", "path": str(destination)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
