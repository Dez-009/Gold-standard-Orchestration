"""CLI utility to view and modify runtime feature flags.

Usage examples:
  python scripts/toggle_feature.py --key=pdf_export --role=pro --enable=true
  python scripts/toggle_feature.py --list

The tool calls ``feature_flag_service.set_feature_flag`` to persist changes in
place. Features are defined in ``utils/feature_keys.ts`` for autocompletion.
"""

import argparse
import re
from pathlib import Path

from database.session import SessionLocal
from services import feature_flag_service


def load_known_keys() -> list[str]:
    """Return the list of feature keys from utils/feature_keys.ts."""
    path = Path(__file__).resolve().parents[1] / "utils" / "feature_keys.ts"
    text = path.read_text(encoding="utf-8")
    match = re.search(r"FEATURE_KEYS\s*=\s*\[(.*?)]", text, re.S)
    if not match:
        return []
    raw = match.group(1)
    found = re.findall(r"'([^']+)'|\"([^\"]+)\"", raw)
    return [a or b for a, b in found]


def list_flags() -> None:
    """Print all existing feature flags."""
    db = SessionLocal()
    try:
        flags = feature_flag_service.list_feature_flags(db)
        for f in flags:
            print(f"{f.feature_key}\t{'enabled' if f.enabled else 'disabled'}\t{f.access_tier.value}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Toggle feature flags from the command line")
    parser.add_argument("--key", help="Feature key", choices=load_known_keys())
    parser.add_argument("--role", default="free", help="Minimum role tier", choices=["free", "plus", "pro", "admin"])
    parser.add_argument("--enable", help="true/false to enable or disable")
    parser.add_argument("--list", action="store_true", help="List current feature flags")
    args = parser.parse_args()

    if args.list:
        list_flags()
        return

    if args.key is None or args.enable is None:
        parser.error("--key and --enable required unless --list is used")
    enabled = str(args.enable).lower() in {"1", "true", "yes"}
    db = SessionLocal()
    try:
        flag = feature_flag_service.set_feature_flag(db, args.key, args.role, enabled)
        print(
            f"{flag.feature_key} => {'enabled' if flag.enabled else 'disabled'} at {flag.access_tier.value}"
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
