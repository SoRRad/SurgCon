from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NORMALIZED_INPUT_PATH = ROOT / "data" / "review" / "normalized_conferences.json"
MERGED_OUTPUT_PATH = ROOT / "data" / "review" / "merged_conferences.json"
EXISTING_MASTER_PATH = ROOT / "src" / "data" / "conferences.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_existing_master_records() -> list[dict]:
    if not EXISTING_MASTER_PATH.exists():
        return []

    return load_json(EXISTING_MASTER_PATH)


def merge_records(records: list[dict]) -> list[dict]:
    merged: dict[str, dict] = {}

    for record in records:
        record_id = record["id"]
        existing = merged.get(record_id)
        if not existing:
            merged[record_id] = record
            continue

        merged[record_id] = {
            **existing,
            **record,
            "categories": sorted(set(existing.get("categories", []) + record.get("categories", []))),
            "tags": sorted(set(existing.get("tags", []) + record.get("tags", []))),
            "sessions": sorted(set(existing.get("sessions", []) + record.get("sessions", []))),
            "flags": sorted(set(existing.get("flags", []) + record.get("flags", []))),
            "abstractTypes": sorted(set(existing.get("abstractTypes", []) + record.get("abstractTypes", []))),
            "confidenceScore": max(existing.get("confidenceScore", 0), record.get("confidenceScore", 0)),
        }

    return list(merged.values())


def merge_with_existing_master(records: list[dict], existing_records: list[dict]) -> list[dict]:
    existing_by_id = {record["id"]: record for record in existing_records}
    merged_records = []

    for record in records:
        existing = existing_by_id.get(record["id"])
        merged_records.append(
            {
                **(existing or {}),
                **record,
                "firstSeenAt": (existing or {}).get("firstSeenAt") or record.get("firstSeenAt"),
                "lastSeenAt": record.get("lastSeenAt") or (existing or {}).get("lastSeenAt"),
                "lastUpdatedAt": record.get("lastUpdatedAt") or (existing or {}).get("lastUpdatedAt"),
            }
        )

    return merged_records


def main() -> None:
    normalized_records = load_json(NORMALIZED_INPUT_PATH)
    existing_records = load_existing_master_records()
    merged_records = merge_with_existing_master(merge_records(normalized_records), existing_records)
    MERGED_OUTPUT_PATH.write_text(json.dumps(merged_records, indent=2) + "\n", encoding="utf-8")
    print(f"Merged {len(normalized_records)} normalized records into {len(merged_records)} publishable records")


if __name__ == "__main__":
    main()
