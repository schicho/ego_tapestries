"""Builds the help texts of the BioFabric study, assets/help/<question>_<condition>.md.

Every help text starts with the part that is specific to the question that is being answered
(in the way that fits the condition), and is followed by the general explanation of BioFabric,
which is the tutorial page of the condition. Run this script again after changing the tutorial
pages or the question specific parts below:

    python build_help_texts.py
"""

from pathlib import Path

ASSETS = Path(__file__).parent / "assets"
HELP_DIR = ASSETS / "help"

CONDITIONS = ["normal", "collapsed"]

TUTORIAL_OF_CONDITION = {
    "normal": ASSETS / "graph_terminology_biofabric.md",
    "collapsed": ASSETS / "graph_terminology_biofabric_collapsed.md",
}

HOW_TO_ANSWER_BY_CLICKING = """### How to answer

Click a node on its horizontal line to select it. Click it again to remove the selection. The nodes highlighted in pink are given by the question: you cannot change them, and they are not part of your answer. Submit your answer once you have selected all the nodes."""

ATTENTION_CHECK_HELP = """## Help: select the first and the last node

The first node is the one on the top horizontal line, and the last node is the one on the bottom horizontal line. Click a node on its horizontal line to select it. Click it again to remove the selection. Submit your answer once you have selected the two nodes."""

QUESTION_SPECIFIC_PARTS = {
    "attention": {"normal": ATTENTION_CHECK_HELP, "collapsed": ATTENTION_CHECK_HELP},
    "connection": {
        "normal": """## Help: are the two nodes connected?

The two nodes highlighted in pink are given. They are connected if a vertical line (a connection) has a circle on the horizontal line of each of the two nodes. Answer **Yes** or **No**.""",
        "collapsed": """## Help: are the two nodes connected?

The two nodes highlighted in pink are given. They are connected if one of them is at the top of a vertical line, and the other one has a circle on that same line. <span style="color: #e03131; font-weight: 600;">If two nodes have a circle on the same vertical line, they are both connected to the node at the TOPMOST end of that line, but not necessarily to each other.</span> Answer **Yes** or **No**.""",
    },
    "task1": {
        "normal": f"""## Help: select the nodes connected to the given node

Find the node highlighted in pink: it is the node the question is about. Every vertical line that has a circle on the horizontal line of this node is a connection to another node: follow the line to the circle on the horizontal line of that other node. All the nodes connected to the given node are **below** it. Select every one of them.

{HOW_TO_ANSWER_BY_CLICKING}""",
        "collapsed": f"""## Help: select the nodes connected to the given node

Find the node highlighted in pink: it is the node the question is about. It is at the top of its own vertical line, and all the nodes connected to it are the other nodes that have a circle on that line, **below** it. Select every one of them.

{HOW_TO_ANSWER_BY_CLICKING}""",
    },
    "task2": {
        "normal": f"""## Help: select the common neighbors of two nodes

Find the two nodes highlighted in pink. A common neighbor is a node that is connected to both of them. The common neighbors are **below** the two nodes. Each of them has circles side by side on its horizontal line: one at the end of a connection (a vertical line) from the first node, and one at the end of a connection from the second node. Select every common neighbor.

{HOW_TO_ANSWER_BY_CLICKING}""",
        "collapsed": f"""## Help: select the common neighbors of two nodes

Find the two nodes highlighted in pink. A common neighbor is a node that is connected to both of them. Both nodes are at the top of their own vertical lines, and the common neighbors are **below** them. Follow the two lines down: a common neighbor has circles side by side on its horizontal line, one on each of the two lines. Select every common neighbor.

{HOW_TO_ANSWER_BY_CLICKING}""",
    },
    "task3": {
        "normal": """## Help: estimate the number of connections

Each vertical line is one connection between two nodes, so you can estimate the number of connections by counting the vertical lines. You only need an estimate, not the exact number. Enter your estimate in the field below the visualization and submit it.""",
        "collapsed": """## Help: estimate the number of connections

Connections that start at the same node share one vertical line. For each vertical line, count the nodes on it and subtract one: that is the number of connections of that line. Add up the results of all the lines. You only need an estimate, not the exact number. Enter your estimate in the field below the visualization and submit it.""",
    },
}


def tutorial_text(condition: str) -> str:
    """The tutorial page, as the general explanation of BioFabric."""
    lines = TUTORIAL_OF_CONDITION[condition].read_text(encoding="utf-8").strip().split("\n")
    assert lines[0].startswith("## ")
    return "\n".join(["## How to read BioFabric"] + lines[1:])


def main() -> None:
    HELP_DIR.mkdir(exist_ok=True)
    for question, parts in QUESTION_SPECIFIC_PARTS.items():
        for condition in CONDITIONS:
            text = f"{parts[condition]}\n\n---\n\n{tutorial_text(condition)}\n"
            (HELP_DIR / f"{question}_{condition}.md").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
