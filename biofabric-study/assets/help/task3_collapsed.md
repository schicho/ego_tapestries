## Help: estimate the number of connections

Connections that start at the same node share one vertical line. For each vertical line, count the nodes on it and subtract one: that is the number of connections of that line. Add up the results of all the lines. You only need an estimate, not the exact number. Give your estimate below the visualization (by choosing an option in the practice, or by entering a number in the actual questions) and submit it.

---

## How to read BioFabric

BioFabric is a way of drawing a network so that its structure is easier to see, especially when the network contains many connections.

Each **node** is shown as a horizontal line running from left to right.

<img alt="Nodes are represented on horizontal lines" src="biofabric-study/assets/images/nodes-collapsed.png" width="50%" mx="auto" />

Each **connection** between two nodes is shown as a vertical line, with a circle on each of the two node lines it joins. In this version of BioFabric, the connections are **collapsed**: all connections that start at the same node share one vertical line.

<img alt="Connections are represented as vertical lines, connections that start at the same node share one line" src="biofabric-study/assets/images/connections-collapsed.png" width="35%" mx="auto" />

### Reading the connections

Two nodes are connected if one of them is at the top of a vertical line, and the other one has a circle on that same line. In the example, node 7 is at the top of the first line, and node 5 has a circle on that line, so node 7 and node 5 are connected.

<img alt="A connection between node 7 and node 5" src="biofabric-study/assets/images/connection-collapsed.png" width="50%" mx="auto" />

<span style="color: #e03131; font-weight: 600;">If two nodes have a circle on the same vertical line, they are both connected to the node at the TOPMOST end of that line, but not necessarily to each other.</span>

A line may also pass over other node lines without a circle: this does not mean that those nodes are connected. Follow the vertical line to identify its top node and its circles.

To find all the neighbors of a node:
- The neighbors **below** the node are the other circles on the vertical line that the node is at the top of.
- The neighbors **above** the node are the nodes at the top of every other vertical line that has a circle on the node's line.

### Finding the common neighbors of two nodes

The common neighbors of two nodes are the nodes that are connected to both of them. In the questions, the common neighbors are always **below** the two nodes. To find them, follow the vertical lines of the two nodes down: a common neighbor has circles **side by side** on its horizontal line, one on the vertical line of each of the two nodes.

<img alt="Nodes 3 and 5 have circles on the lines of both node 7 and node 1, so they are common neighbors" src="biofabric-study/assets/images/common-neighbors-collapsed.png" width="50%" mx="auto" />

In the example, nodes 3 and 5 have a circle on the line of node 7 and on the line of node 1, so they are common neighbors of node 7 and node 1.

### Counting the connections

Every node on a vertical line, except the one at the top, is connected to the top node: that is one connection for each of these nodes. So the number of connections of a line is the **number of nodes on the line minus one**. Do this for every vertical line and add up the results to get the total number of connections.

<img alt="Counting the connections: the nodes on each line minus one, added up" src="biofabric-study/assets/images/counting-collapsed.png" width="50%" mx="auto" />

In the example, the lines have 6, 4, 2, 3, 3, 2 and 2 nodes, so 5 + 3 + 1 + 2 + 2 + 1 + 1 = 15 connections. In the questions, you only need to **estimate** the number of connections, so you do not need to count exactly.

In the examples that follow, use the horizontal lines to identify nodes, and the vertical lines to trace the connections between them.

### Selecting Nodes

The diagram is interactive: clicking a node on its horizontal line highlights that node. Click the node again to remove the highlight.

In the questions, you will also use this to give your answers by selecting the nodes you want to answer with.

<img alt="Clicking a node highlights its line" src="biofabric-study/assets/images/interactivity-collapsed.png" width="50%" mx="auto" />
