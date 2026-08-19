import json
import pathlib


ROOT = pathlib.Path(__file__).parent

PERFORMER_CODES = [
    "AT",
    "IL",
    "EE",
    "SE",
    "DE",
    "GR",
    "FR",
    "AL",
    "UA",
    "CH",
    "IT",
    "NL",
    "FI",
    "PL",
    "SM",
    "BE",
    "AM",
    "PT",
    "NO",
    "LT",
    "MT",
    "ES",
    "DK",
    "GB",
    "IS",
    "ME",
]

EU_CODES = {
    "AT", "BE", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
    "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
    "ES", "SE",
}
ASIA_CODES = {"AM", "AZ", "GE", "IL"}
OCEANIA_CODES = {"AU"}


def group_for(code):
    if code in EU_CODES:
        return "EU"
    if code in ASIA_CODES:
        return "asia"
    if code in OCEANIA_CODES:
        return "oceania"
    return "european non eu"


def main():
    countries = json.loads((ROOT / "esc-countries.json").read_text())
    results = json.loads((ROOT / "esc-final.json").read_text())["performances"]
    country_by_contestant = dict(enumerate(PERFORMER_CODES))
    participating_codes = {
        country
        for performance in results
        for score in performance["scores"]
        if score["name"] == "total"
        for country in score["votes"]
        if country in countries
    }
    participating_codes.update(country_by_contestant.values())

    graph = {
        "nodes": [
            {"id": code, "label": name, "group": group_for(code), "level": 1}
            for code, name in countries.items()
            if code in participating_codes
        ],
        "links": [],
    }

    for performance in results:
        target = country_by_contestant[performance["contestantId"]]
        total = next(
            score for score in performance["scores"] if score["name"] == "total"
        )
        for source, weight in total["votes"].items():
            if source in participating_codes and weight:
                graph["links"].append(
                    {
                        "source": source,
                        "target": target,
                        "group": "vote",
                        "weight": weight,
                        "label": f"{countries[source]} to {countries[target]}",
                    }
                )

    (ROOT / "esc-network.json").write_text(json.dumps(graph, indent=2) + "\n")


if __name__ == "__main__":
    main()
