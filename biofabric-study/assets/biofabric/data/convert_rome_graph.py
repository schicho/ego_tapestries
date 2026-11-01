"""Convert a graph of the Rome benchmark set to the format used by the BioFabric study.

The nodes (which only have numeric ids in the benchmark set) are renamed to first names,
and every node and edge gets the fields that the BioFabric visualization expects.
The names are assigned in the order of the node ids, using the names of the nodes of
selected-rome-data/large/grafo7907.80.json (the largest graph), so that all graphs share
the same name pool.

Example:
    python convert_rome_graph.py ../../../../rome/data/grafo1000.14.json selected-rome-data/small/grafo1000.14.json
"""

import argparse
import json
from pathlib import Path

NAME_POOL_GRAPH = Path(__file__).parent / "selected-rome-data/large/grafo7907.80.json"


def load_name_pool() -> list[str]:
    graph = json.loads(NAME_POOL_GRAPH.read_text(encoding="utf-8"))
    return [node["id"] for node in graph["nodes"]]


def convert(raw: dict, names: list[str]) -> dict:
    node_ids = [node["id"] for node in raw["nodes"]]
    if len(node_ids) > len(names):
        raise ValueError(f"Not enough names ({len(names)}) for {len(node_ids)} nodes")
    # the ids are numeric strings, order them numerically to be deterministic
    name_of = dict(zip(sorted(node_ids, key=int), names))

    return {
        "nodes": [
            {"id": name_of[node_id], "label": name_of[node_id], "group": "all", "level": 1}
            for node_id in node_ids
        ],
        "links": [
            {
                "source": name_of[link["source"]],
                "target": name_of[link["target"]],
                "group": "all",
                "weight": 1,
                "label": "",
            }
            for link in raw["links"]
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    raw = json.loads(args.input.read_text(encoding="utf-8"))
    converted = convert(raw, load_name_pool())
    args.output.write_text(json.dumps(converted, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
