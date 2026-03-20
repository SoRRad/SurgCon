from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MERGED_INPUT_PATH = ROOT / "data" / "review" / "merged_conferences.json"
FLAGGED_OUTPUT_PATH = ROOT / "data" / "review" / "flagged_conferences.json"

REQUIRED_FIELDS = [
    "id",
    "name",
    "organization",
    "categories",
    "tags",
    "year",
    "country",
    "regionGroup",
    "format",
    "sourceType",
    "reviewStatus",
    "lastChecked",
]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    merged_records = load_json(MERGED_INPUT_PATH)
    flagged_items = []

    for record in merged_records:
        issues = []

        for field in REQUIRED_FIELDS:
            if not record.get(field):
                issues.append(f"Missing required field: {field}")

        year = record.get("year")
        if year is not None and year < 2024:
            issues.append("Conference year is older than 2024")

        if record.get("sourceType") not in {"official", "trusted-directory", "aggregator", "legacy", "manual", "user-submitted"}:
            issues.append("Invalid sourceType")

        if record.get("reviewStatus") not in {"confirmed", "candidate", "flagged"}:
            issues.append("Invalid reviewStatus")

        if record.get("moderationStatus") not in {"submitted", "under review", "approved", "flagged"}:
            issues.append("Invalid moderationStatus")

        if issues:
            flagged_items.append(
                {
                    "id": record.get("id"),
                    "name": record.get("name"),
                    "issues": issues,
                }
            )

    FLAGGED_OUTPUT_PATH.write_text(json.dumps(flagged_items, indent=2) + "\n", encoding="utf-8")
    print(f"Validation complete. Flagged {len(flagged_items)} records.")


if __name__ == "__main__":
    main()
