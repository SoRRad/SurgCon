from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_CATALOG_PATH = ROOT / "src" / "data" / "sources.json"
SOURCE_RECORDS_PATH = ROOT / "src" / "data" / "conferenceSources.json"
RAW_OUTPUT_PATH = ROOT / "data" / "raw" / "discovered_conferences.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def flatten_source_catalog(source_catalog: dict) -> list[dict]:
    flattened_sources = []

    for group_name, group_items in source_catalog.items():
        for item in group_items:
            flattened_sources.append(
                {
                    **item,
                    "group": group_name,
                }
            )

    return flattened_sources


def main() -> None:
    source_catalog = load_json(SOURCE_CATALOG_PATH)
    source_records = load_json(SOURCE_RECORDS_PATH)
    flattened_sources = flatten_source_catalog(source_catalog)

    discovered = []
    for record in source_records:
        discovered.append(
            {
                "id": record["id"],
                "name": record["name"],
                "year": record.get("year"),
                "categories": record.get("categories", []),
                "meetingUrl": record.get("meetingUrl", ""),
                "sourceUrl": record.get("sourceUrl", ""),
                "sourceType": record.get("sourceType", "manual"),
                "reviewStatus": record.get("reviewStatus", "confirmed"),
                "lastChecked": record.get("lastChecked"),
                "flags": record.get("flags", []),
            }
        )

    payload = {
        "generatedAt": datetime.now(UTC).isoformat(),
        "configuredSources": flattened_sources,
        "candidates": discovered,
        "notes": [
            "This pipeline is review-oriented and source-registry based.",
            "Trusted directories can be used for discovery, but official society or meeting pages should remain the preferred source of truth whenever available.",
            "It does not claim automated scraping of official sites.",
            "Add or update curated records in src/data/conferenceSources.json, then rerun the pipeline.",
        ],
        "sourceGroupCounts": {
            group_name: len(group_items) for group_name, group_items in source_catalog.items()
        },
    }

    RAW_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(discovered)} discovered conference candidates to {RAW_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
