from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_RECORDS_PATH = ROOT / "src" / "data" / "conferenceSources.json"
NORMALIZED_OUTPUT_PATH = ROOT / "data" / "review" / "normalized_conferences.json"

STANDARD_CATEGORIES = {
    "Breast & Melanoma Surgical Oncology",
    "Cardiothoracic Surgery",
    "Cardiovascular Surgery",
    "Colon and Rectal Surgery",
    "Endocrine Surgery",
    "Hepatobiliary and Pancreas Surgery",
    "Metabolic & Abdominal Wall Reconstructive Surgery",
    "Neurologic Surgery",
    "Obstetrics and Gynecology Surgery",
    "Oral and Maxillofacial Surgery",
    "Orthopedic Surgery",
    "Otolaryngology / Head and Neck Surgery",
    "Pediatric Surgery",
    "Plastic & Reconstructive Surgery",
    "Thoracic Surgery",
    "Trauma, Critical Care, and General Surgery",
    "Vascular Surgery",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_category(value: str) -> str:
    if value == "Bariatric Surgery":
        return "Metabolic & Abdominal Wall Reconstructive Surgery"
    if value in {"Plastic Surgery", "Aesthetic Surgery", "Plastic & Reconstructive Surgery"}:
        return "Plastic & Reconstructive Surgery"
    if value == "Otolaryngology / Head & Neck Surgery":
        return "Otolaryngology / Head and Neck Surgery"
    if value == "Colon & Rectal Surgery":
        return "Colon and Rectal Surgery"
    if value == "Hepatobiliary & Pancreas Surgery":
        return "Hepatobiliary and Pancreas Surgery"
    return value if value in STANDARD_CATEGORIES else "Trauma, Critical Care, and General Surgery"


def infer_region(country: str) -> str:
    if country == "United States":
        return "United States"
    if country == "Canada":
        return "Canada"
    return "Other International"


def main() -> None:
    source_records = load_json(SOURCE_RECORDS_PATH)
    normalized_records = []
    today = datetime.now(UTC).date().isoformat()

    for record in source_records:
        categories = sorted({normalize_category(item) for item in record.get("categories", [])})
        city = record.get("city", "TBD")
        state = record.get("state", "")
        country = record.get("country", "TBD")

        normalized_records.append(
            {
                "id": record["id"],
                "name": record["name"],
                "organization": record["organization"],
                "categories": categories or ["Trauma, Critical Care, and General Surgery"],
                "tags": sorted(set(record.get("tags", []))),
                "startDate": record.get("startDate"),
                "endDate": record.get("endDate") or record.get("startDate"),
                "year": record.get("year"),
                "city": city,
                "state": state,
                "country": country,
                "regionGroup": record.get("regionGroup") or infer_region(country),
                "format": record.get("format", "TBD"),
                "abstractDeadline": record.get("abstractDeadline", "TBD"),
                "meetingUrl": record.get("meetingUrl", ""),
                "sourceUrl": record.get("sourceUrl", record.get("meetingUrl", "")),
                "sourceType": record.get("sourceType", "manual"),
                "confidenceScore": record.get("confidenceScore", 0.7),
                "reviewStatus": record.get("reviewStatus", "confirmed"),
                "verifiedAt": record.get("verifiedAt"),
                "lastChecked": record.get("lastChecked", today),
                "venue": record.get("venue", ""),
                "venueAddress": record.get("venueAddress", ""),
                "notes": record.get("notes", ""),
                "featured": bool(record.get("featured", False)),
                "cme": record.get("cme", record.get("cmeCredits")),
                "sessions": record.get("sessions", record.get("sessionHighlights", [])),
                "flags": record.get("flags", []),
                "firstSeenAt": record.get("firstSeenAt", record.get("addedAt")),
                "lastSeenAt": record.get("lastSeenAt"),
                "lastUpdatedAt": record.get("lastUpdatedAt", record.get("updatedAt")),
                "dateChangedRecently": bool(record.get("dateChangedRecently", False)),
                "likelyRecurringMeeting": bool(record.get("likelyRecurringMeeting", False)),
                "isInferred": bool(record.get("isInferred", False)),
                "journalAssociation": record.get("journalAssociation", ""),
                "abstractTypes": record.get("abstractTypes", []),
                "residentPaperCompetition": record.get("residentPaperCompetition", ""),
                "travelScholarshipNotes": record.get("travelScholarshipNotes", ""),
                "membershipRelevance": record.get("membershipRelevance", ""),
                "acceptsAbstracts": record.get("acceptsAbstracts"),
                "acceptsVideos": bool(record.get("acceptsVideos", False)),
                "acceptsPosters": bool(record.get("acceptsPosters", False)),
                "acceptsLateBreaking": bool(record.get("acceptsLateBreaking", False)),
                "moderationStatus": record.get("moderationStatus", "approved"),
                "seriesId": record.get("seriesId", ""),
            }
        )

    NORMALIZED_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    NORMALIZED_OUTPUT_PATH.write_text(json.dumps(normalized_records, indent=2) + "\n", encoding="utf-8")
    print(f"Normalized {len(normalized_records)} conference records to {NORMALIZED_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
