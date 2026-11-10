import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { State } from './state.js';
import { CompressionMsg, NODE_COMPRESSION, EDGE_COMPRESSION, ALL_UNCOMPRESS, ALL_NODE_COMPRESS_FULL, ALL_EDGE_COMPRESS_HALF, ALL_EDGE_COMPRESS_FULL } from "./CompressionMsg.js";

const transitionDuration = 300;

export class BioFabricRenderer {

    // Constructor
    constructor(biofabric, canvasWidth, canvasHeight, globalDispatcher = d3.dispatch("highlight", "hover-in", "hover-out", "compression", "edge-hover-in", "edge-hover-out")) {

        //
        this.biofabric = biofabric;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.globalDispatcher = globalDispatcher;

        // InnerG (x,y)
        this.innerX = 0.2
        this.innerY = 0.2

        // NodeDepthG (x,y)
        this.nodeDepthX = 0.025
        this.nodeDepthY = 0.2

        // Node G (x,y)
        this.nodeGX = 0.05
        this.nodeGY = 0.2

        // EdgeDepthG (x,y)
        this.edgeDepthX = 0.2
        this.edgeDepthY = 0.05
    }

    // Renderer
    render(svg) {

        // G for the Depth Circles of the Nodes
        let nodeDepthG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.nodeDepthX) + "," + (this.canvasHeight * this.nodeDepthY) + ")")

        let edgeDepthG = svg
            .append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.edgeDepthX) + "," + (this.canvasHeight * this.edgeDepthY) + ")")

        // G that contains the Graph Drawing
        let innerG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.innerX) + "," + (this.canvasHeight * this.innerY) + ")")

        // G that contains the Node Information
        let nodeG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.nodeGX) + "," + (this.canvasHeight * this.nodeGY) + ")")

        let compressG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.nodeDepthX) + "," + (this.canvasHeight * this.edgeDepthY) + ")")

        // Iterate over all Nodes in Depth Limit
        for (let node of this.biofabric.graph.nodes.filter(node => (node.get_depth() <= this.biofabric.graph.get_depth()))) {

            // Append a Node Line
            innerG.append("line")
                .attr("id", "nodeLine-" + node.get_id())
                .attr("class", "nodeline")
                .datum(node) // node data
                .attr("x1", 0)
                .attr("x2", this.canvasWidth * (0.95 * (1 - this.innerX)))
                .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("stroke", "#eee")
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("hover-out");
                });

            // Add Node Text
            nodeG.append("text")
                .attr("id", "nodeText-" + node.get_id())
                .attr("class", "nodetext")
                .datum(node) // node data
                .attr("x", 0.95 * this.canvasWidth * (this.innerX - this.nodeGX))
                .attr("y", node.get_y() * (this.canvasHeight * (1 - this.nodeGY)))
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .text(node.get_label())
                .attr("fill", "#333")
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("hover-out");
                });
        }

        compressG.append("circle")
            .attr("id", "compressAllNodesButton")
            .attr("cx", 0)
            .attr("cy", 2)
            .attr("r", 0.5)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 0.2)
            .style("cursor", "pointer")
            .on("mouseover", () => {
                d3.select("#compressAllNodesButton")
                    .transition(transitionDuration)
                    .attr("fill", "white")
                    .transition(transitionDuration)
                    .attr("fill", "black");
            })
            .on("mouseout", () => {
                d3.select("#compressAllNodesButton")
                    .transition(transitionDuration)
                    .attr("fill", "black");
            })
            .on("click", () => {
                this.globalDispatcher.call("compression", this, new CompressionMsg(null, ALL_NODE_COMPRESS_FULL));
            });

        // require a group for the half step to render the semi circle and the circle
        let compressAllEdgesHalfButton = compressG.append("g").attr("transform", "translate(" + (2) + "," + (0) + ")");

        compressAllEdgesHalfButton
            .append("path")
            .attr("id", "compressAllEdgesHalfButtonPath")
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 0)
            .attr("d", () => {
                let curve = d3.line().curve(d3.curveBasisClosed)
                return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]]);
            })

        compressAllEdgesHalfButton.append("circle")
            .attr("id", "compressAllEdgesHalfButton")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 0.5)
            .attr("fill", "white")
            .attr("fill-opacity", "0")
            .attr("stroke", "black")
            .attr("stroke-width", 0.2)
            .style("cursor", "pointer")
            .on("mouseover", () => {
                d3.select("#compressAllEdgesHalfButtonPath")
                    .transition(transitionDuration)
                    .attr("d", () => {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                    })
                    .transition(transitionDuration)
                    .attr("d", () => {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]]);
                    })
            })
            .on("mouseout", () => {
                d3.select("#compressAllEdgesHalfButtonPath")
                    .attr("d", () => {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]]);
                    })
            })
            .on("click", () => {
                this.globalDispatcher.call("compression", this, new CompressionMsg(null, ALL_EDGE_COMPRESS_HALF));
            })



        compressG.append("circle")
            .attr("id", "compressAllEdgesButton")
            .attr("cx", 4)
            .attr("cy", 0)
            .attr("r", 0.5)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 0.2)
            .style("cursor", "pointer")
            .on("mouseover", () => {
                d3.select("#compressAllEdgesButton")
                    .transition(transitionDuration)
                    .attr("fill", "white")
                    .transition(transitionDuration)
                    .attr("fill", "black");
            })
            .on("mouseout", () => {
                d3.select("#compressAllEdgesButton")
                    .transition(transitionDuration)
                    .attr("fill", "black");
            })
            .on("click", () => {
                this.globalDispatcher.call("compression", this, new CompressionMsg(null, ALL_EDGE_COMPRESS_FULL));
            });

        // uncompress All Button
        compressG.append("circle")
            .attr("id", "uncompressAllButton")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 0.5)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 0.2)
            .style("cursor", "pointer")
            .on("mouseover", () => {
                d3.select("#uncompressAllButton")
                    .transition(transitionDuration)
                    .attr("fill", "black")
                    .transition(transitionDuration)
                    .attr("fill", "white");
            })
            .on("mouseout", () => {
                d3.select("#uncompressAllButton")

                    .transition(transitionDuration)
                    .attr("fill", "white");
            })
            .on("click", () => {
                this.globalDispatcher.call("compression", this, new CompressionMsg(null, ALL_UNCOMPRESS));
            });

        // Iterate over unique node Depths       
        let nodeDepthIcons = [...new Set(this.biofabric.nodeDepths.filter(nodeDepth => nodeDepth.get_depth() <= this.biofabric.graph.get_depth()))]
        for (let nodeDepthIcon of nodeDepthIcons) {

            // Extract Current Depth and its Nodes
            let depthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepthIcon.get_depth());

            // Append a Node Depth Line
            nodeDepthG.append("line")
                .attr("id", "nodeDepthLine-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                .attr("class", "nodeDepthLine")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", Math.min.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("y2", Math.max.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("stroke", ("#333"))
                .attr("stroke-width", 0.2)
                .attr("stroke-linecap", "round")

            // Append a Node Depth Cirlce
            let nodeDepthCircleG = nodeDepthG.append("g")
                .attr("id", "nodeDepthCircle-" + nodeDepthIcon.get_depth().toString().replace(".", "-") + "G")
                .attr("transform", "translate(" + (0) + "," + (nodeDepthIcon.get_y() * (this.canvasHeight * (1 - this.innerY))) + ")")

            // Node Depth Circle Background Color
            nodeDepthCircleG.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "white")
                .attr("r", 0.8)

            nodeDepthCircleG.append("text")
                .attr("id", "nodeDepthCircleText-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                .attr("x", 1.5)
                .attr("y", 0)
                .attr("class", "nodegrouptext")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#333")
                .text(nodeDepthIcon.get_group_label());

            // Node Depth Circles Icon Paths
            nodeDepthCircleG.append("path")
                .attr('opacity', () => {
                    if (nodeDepthIcon.get_state() != State["Uncompressed"]) {
                        return "1"
                    } else {
                        return "0"
                    }
                }
                )
                .attr("d", () => {
                    let curve = d3.line().curve(d3.curveBasisClosed)
                    if (nodeDepthIcon.get_state() == State["Singleton"]) {
                        return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                    } else {
                        return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                    }
                }
                )
                .attr("id", "nodeDepthCircleIcon-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                .attr('fill', "#333")

            // Node Depth Circles
            nodeDepthCircleG.append("circle")
                .attr("id", "nodeDepthCircle-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                .attr("class", "nodeDepthCircle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 0.5)
                .attr("fill", "white")
                .attr("fill-opacity", "0")
                .attr("stroke", "#333")
                .attr("stroke-width", 0.2)
                .on("click", () => {
                    // Check if Depth is not Singleton/Empty -> update drawing if not so
                    if ((nodeDepthIcon.get_state() != State["Singleton"]) && (nodeDepthIcon.get_state() != State["Empty"])) {
                        this.globalDispatcher.call("compression", this, new CompressionMsg(nodeDepthIcon, NODE_COMPRESSION));
                    }
                })
                .style("cursor", () => {
                    // Change Cursor on hover over non-singleton circles
                    if (depthNodes[0].get_state() == State["Singleton"]) {
                        return "default";
                    } else {
                        return "pointer";
                    }

                }
                )
        }

        // Iterate over all Edges in Depth Limit
        for (let edge of this.biofabric.graph.edges.filter(edge => (edge.get_depth() <= this.biofabric.graph.get_depth()))) {

            let edgeG = innerG.append("g")
                .attr("id", "edgeG-" + edge.get_id())
                .attr("class", "edgeG")
                .datum(edge);

            // Append an Edge Line
            edgeG
                .append("line")
                .attr("id", "edgeLine-" + edge.get_id())
                .attr("class", "edgeLine")
                .datum(edge) // edge data
                .attr("y1", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("x1", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("x2", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("stroke", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .attr("stroke-width", 30 / this.biofabric.graph.edges.filter(e => e.get_depth() <= this.biofabric.graph.get_depth()).length)
                .attr("stroke-linecap", "round")
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("edge-hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("edge-hover-out");
                });

            edgeG
                .append("circle")
                .attr("id", "edgeCircleSource-" + edge.get_id())
                .attr('class', "edgecircle")
                .datum(edge.endpoints[0]) // source vertex data
                .attr("cy", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("r", 30 / this.biofabric.graph.edges.filter(e => e.get_depth() <= this.biofabric.graph.get_depth()).length)
                .attr("stroke-width", "0")
                .attr("fill", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("hover-out");
                });

            edgeG
                .append("circle")
                .attr("id", "edgeCircleTarget-" + edge.get_id())
                .attr('class', "edgecircle")
                .datum(edge.endpoints[1]) // target vertex data
                .attr("cy", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("r", 30 / this.biofabric.graph.edges.filter(e => e.get_depth() <= this.biofabric.graph.get_depth()).length)
                .attr("stroke-width", "0")
                .attr("fill", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("hover-out");
                });
        }

        for (let edgeDepth of this.biofabric.edgeDepths) {
            edgeDepthG.append("line")
                .attr("id", "edgeDepthLine-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("class", "edgeDepthLine")
                .attr("x1", edgeDepth.get_min_x() * this.canvasWidth * (1 - this.edgeDepthX))
                .attr("x2", edgeDepth.get_max_x() * this.canvasWidth * (1 - this.edgeDepthX))
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 0.2)
                .attr("visibility", () => {
                    if ((edgeDepth.get_state() == State["Singleton"]) || (edgeDepth.get_state() == State["Empty"])) {
                        return "hidden"
                    } else {
                        return "visible"
                    }
                });

            let edgeDepthCircleG = edgeDepthG.append("g")
                .attr("id", "edgeDepthCircle-" + edgeDepth.get_depth().toString().replace(".", "-") + "G")
                .attr("transform", "translate(" + (edgeDepth.get_x() * this.canvasWidth * (1 - this.edgeDepthX)) + "," + (0) + ")")
                .attr("visibility", () => {
                    if ((edgeDepth.get_state() == State["Singleton"]) || (edgeDepth.get_state() == State["Empty"])) {
                        return "hidden"
                    } else {
                        return "visible"
                    }
                });

            edgeDepthCircleG.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "white")
                .attr("r", 0.8)

            // Edge Depth Circles Icon Paths
            edgeDepthCircleG.append("path")
                .attr('opacity', () => {
                    if (edgeDepth.get_state() != State["Uncompressed"]) {
                        return "1"
                    } else {
                        return "0"
                    }
                }
                )
                .attr("d", () => {
                    if (edgeDepth.get_state() == State["Empty"]) {
                        let curve = d3.line();
                        return curve([[-0.3, -0.3], [0, 0], [0.3, 0.3], [0, 0], [-0.3, 0.3], [0, 0], [0.3, -0.3]])
                    } else if (edgeDepth.get_state() == State["Singleton"]) {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                    } else {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                    }
                }
                )
                .attr("id", "edgeDepthCircleIcon-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("stroke", ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                .attr("stroke-width", () => {
                    if (edgeDepth.get_state() == State["Empty"]) {
                        return 0.2
                    } else {
                        return 0
                    }
                })
                .attr('fill', () => {
                    if (edgeDepth.get_state() == State["Empty"]) {
                        return "none"
                    } else {
                        return ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()]
                    }
                });



            edgeDepthCircleG.append("circle")
                .attr("id", "edgeDepthCircle-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("classedgeDepthCircleG", "depthCircle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("stroke-width", 0.2)
                .attr("r", 0.5)
                .attr("fill", "white")
                .attr('fill-opacity', 0)
                .attr("stroke", ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                .style("cursor", () => {
                    if (edgeDepth.get_state() == State["Singleton"] || edgeDepth.get_state() == State["Empty"]) {
                        return "default"
                    } else {
                        return "pointer"
                    }
                }
                )
                .on("click", () => {
                    // Ensure Current Depth's EdgeSet is not Singleton or Empty
                    if ((edgeDepth.get_state() != State["Singleton"]) && (edgeDepth.get_state() != State["Empty"])) {
                        this.globalDispatcher.call("compression", this, new CompressionMsg(edgeDepth, EDGE_COMPRESSION));
                    }
                });

            edgeDepthCircleG.append("text")
                .attr("id", "edgeDepthCircleText-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("x", 0)
                .attr("y", 1.5)
                .attr("text-anchor", "middle")
                .attr("class", "edgetext")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#333")
                .text(edgeDepth.get_group_label());
        }



        const compressionFn = (msg) => {
            if (msg.compressionType == NODE_COMPRESSION
                || msg.compressionType == ALL_NODE_COMPRESS_FULL
                || msg.compressionType == ALL_UNCOMPRESS) {

                // normal singular toggle of a depth icon
                if (msg.compressionType == NODE_COMPRESSION) {
                    const nodeDepthIcon = msg.msg;
                    let depthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepthIcon.get_depth());

                    // Switch the State of the DepthIcon
                    switch (nodeDepthIcon.get_state()) {
                        case State["Uncompressed"]:
                            nodeDepthIcon.set_state(State["Fully Compressed"])
                            break;
                        case State["Fully Compressed"]:
                            nodeDepthIcon.set_state(State["Uncompressed"]);
                            break;
                    }

                    // Iterate over all nodes in the current depth and update their state
                    for (let depthNode of depthNodes) {
                        switch (depthNode.get_state()) {
                            case State["Uncompressed"]:
                                depthNode.set_state(State["Fully Compressed"])
                                break;
                            case State["Fully Compressed"]:
                                depthNode.set_state(State["Uncompressed"]);
                                break;
                        }
                    }
                }

                if (msg.compressionType == ALL_NODE_COMPRESS_FULL || msg.compressionType == ALL_UNCOMPRESS) {
                    const targetState = (msg.compressionType == ALL_NODE_COMPRESS_FULL) ?
                        State["Fully Compressed"] : State["Uncompressed"];

                    for (let nodeDepthIcon of this.biofabric.nodeDepths) {
                        if (nodeDepthIcon.get_state() == State["Singleton"] || nodeDepthIcon.get_state() == State["Empty"]) {
                            continue;
                        }
                        nodeDepthIcon.set_state(targetState)
                    }
                    for (let node of this.biofabric.graph.nodes) {
                        if (node.get_state() == State["Singleton"] || node.get_state() == State["Empty"]) {
                            continue;
                        }
                        node.set_state(targetState)
                    }
                }

                // Recalculcate the Y Coordinates of the now (un)compressed states
                this.biofabric.calculate_node_y_coordinates();
                this.biofabric.calculcate_depth_y_coordinates();

                // Iterate over nodes and update the node lines
                for (let node of this.biofabric.graph.nodes.filter(node => node.get_depth() <= this.biofabric.graph.get_depth())) {

                    // Update Node Lines
                    innerG.select("#" + "nodeLine-" + node.get_id())
                        .transition()
                        .duration(transitionDuration)
                        .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                        .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))

                    let nodesInDepthCount = this.biofabric.graph.nodes.filter(n => n.get_depth() == node.get_depth()).length;

                    // (Un)collapse Node Text
                    nodeG.select("#" + "nodeText-" + node.get_id())
                        .transition()
                        .duration(transitionDuration)
                        .attr("y", node.get_y() * (this.canvasHeight * (1 - this.nodeGY)))
                        .text(() => {
                            if (node.get_state() == State["Fully Compressed"]) {
                                return nodesInDepthCount + " Nodes"
                            } else {
                                return node.get_label()
                            }
                        })
                }

                // Iterate over depths and update their positions
                for (let nodeDepthIconB of nodeDepthIcons) {

                    // update the Endpoints of the Depth lines
                    nodeDepthG.select("#nodeDepthLine-" + nodeDepthIconB.get_depth().toString().replace(".", "-"))
                        .transition()
                        .duration(transitionDuration)
                        .attr("y1", nodeDepthIconB.get_min_y() * (this.canvasHeight * (1 - this.innerY)))
                        .attr("y2", nodeDepthIconB.get_max_y() * (this.canvasHeight * (1 - this.innerY)))

                    // Update the Positions of the Depth Circle G's which contain the Depth Circles and their Icons
                    nodeDepthG.select("#nodeDepthCircle-" + nodeDepthIconB.get_depth().toString().replace(".", "-") + "G")
                        .transition()
                        .duration(transitionDuration)
                        .attr("transform", "translate(0," + nodeDepthIconB.get_y() * (this.canvasHeight * (1 - this.innerY)) + ")")

                    nodeDepthG.select("#nodeDepthCircleIcon-" + nodeDepthIconB.get_depth().toString().replace(".", "-"))
                        .transition()
                        .duration(transitionDuration)
                        .attr("opacity", () => {
                            if (nodeDepthIconB.get_state() == State["Uncompressed"]) {
                                return "0"
                            } else {
                                return "1"
                            }
                        })
                        .attr("d", () => {
                            let curve = d3.line().curve(d3.curveBasisClosed)
                            switch (nodeDepthIconB.get_state()) {
                                case State["Singleton"]:
                                    return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]]);
                                case State["Partially Compressed"]:
                                    return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]]);
                                case State["Fully Compressed"]:
                                    return curve([[0, 0.7], [-0.7, 0], [0, -0.7], [0.7, 0]]);
                                case State["Uncompressed"]:
                                    return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]]);
                            }
                        })
                }

                for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() <= this.biofabric.graph.get_depth())) {

                    innerG
                        .select("#" + "edgeLine-" + edge.get_id())
                        .transition("edgeLineYTransition") // named transition to avoid conflicts with the edge line X transition triggered by edge compression
                        .duration(transitionDuration)
                        .attr("y1", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                        .attr("y2", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)));

                    innerG
                        .select("#" + "edgeCircleTarget-" + edge.get_id())
                        .transition("edgeCircleTargetYTransition") // named transition to avoid conflicts with the edge circle target X transition triggered by edge compression
                        .duration(transitionDuration)
                        .attr("cy", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)));

                    innerG
                        .select("#" + "edgeCircleSource-" + edge.get_id())
                        .transition("edgeCircleSourceYTransition") // ditto
                        .duration(transitionDuration)
                        .attr("cy", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)));

                }
            }

            // -----------------------------------------------------------------------------------------------------------------------------------------------------
            // Continuing with Edge Depth Icon Toggle. Unfortunaltely, this has to be in the same function, as calls from other visualizations do not differentiate.
            // -----------------------------------------------------------------------------------------------------------------------------------------------------

            if (msg.compressionType == EDGE_COMPRESSION
                || msg.compressionType == ALL_EDGE_COMPRESS_HALF
                || msg.compressionType == ALL_EDGE_COMPRESS_FULL
                || msg.compressionType == ALL_UNCOMPRESS) {

                // normal singular compression
                if (msg.compressionType == EDGE_COMPRESSION) {
                    const edgeDepth = msg.msg;

                    // Switch the State of the DepthIcon
                    switch (edgeDepth.get_state()) {
                        case State["Uncompressed"]:
                            edgeDepth.set_state(State["Partially Compressed"])
                            break;
                        case State["Partially Compressed"]:
                            edgeDepth.set_state(State["Fully Compressed"])
                            break;
                        case State["Fully Compressed"]:
                            edgeDepth.set_state(State["Uncompressed"]);
                            break;
                    }


                    // Set the New States (Un/Fully/Partially Compressed) for all edges in clicked Depth
                    for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() == edgeDepth.get_depth())) {
                        switch (edge.get_state()) {
                            case (State["Uncompressed"]):
                                edge.set_state(State["Partially Compressed"]);
                                break;
                            case (State["Partially Compressed"]):
                                edge.set_state(State["Fully Compressed"]);
                                break;
                            case (State["Fully Compressed"]):
                                edge.set_state(State["Uncompressed"]);
                                break;
                        }
                    }
                }

                // batch compression
                if (msg.compressionType == ALL_EDGE_COMPRESS_HALF || msg.compressionType == ALL_EDGE_COMPRESS_FULL || msg.compressionType == ALL_UNCOMPRESS) {
                    const targetState = (msg.compressionType == ALL_EDGE_COMPRESS_HALF) ? State["Partially Compressed"] :
                        (msg.compressionType == ALL_EDGE_COMPRESS_FULL) ? State["Fully Compressed"] : State["Uncompressed"];

                    for (let edgeDepth of this.biofabric.edgeDepths) {
                        if (edgeDepth.get_state() == State["Singleton"] || edgeDepth.get_state() == State["Empty"]) {
                            continue;
                        }
                        edgeDepth.set_state(targetState)
                    }
                    for (let edge of this.biofabric.graph.edges) {
                        if (edge.get_state() == State["Singleton"] || edge.get_state() == State["Empty"]) {
                            continue;
                        }
                        edge.set_state(targetState)
                    }
                }

                // Recalculate the X coordinates of the now partially/un/fully compressed edges
                this.biofabric.calculate_edge_x_coordinates();
                this.biofabric.calculcate_depth_x_coordinates();

                // Iterate over all edges (and their circle termini) and update their x coordinates
                for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() <= this.biofabric.graph.get_depth())) {

                    innerG.select("#edgeLine-" + edge.get_id())
                        .transition("edgeLineXTransition")
                        .duration(transitionDuration)
                        .attr("x1", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                        .attr("x2", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                    innerG.select("#edgeCircleSource-" + edge.get_id())
                        .transition("edgeCircleSourceXTransition")
                        .duration(transitionDuration)
                        .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                    innerG.select("#edgeCircleTarget-" + edge.get_id())
                        .transition("edgeCircleTargetXTransition")
                        .duration(transitionDuration)
                        .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                }

                // Iterate over all depth circles and lines and update their positions
                for (let edgeDepthB of this.biofabric.edgeDepths) {

                    edgeDepthG.select("#edgeDepthLine-" + edgeDepthB.get_depth().toString().replace(".", "-"))
                        .transition()
                        .duration(transitionDuration)
                        .attr("x1", edgeDepthB.get_min_x() * this.canvasWidth * (1 - this.edgeDepthX))
                        .attr("x2", edgeDepthB.get_max_x() * this.canvasWidth * (1 - this.edgeDepthX))

                    edgeDepthG.select("#edgeDepthCircle-" + edgeDepthB.get_depth().toString().replace(".", "-") + "G")
                        .transition()
                        .duration(transitionDuration)
                        .attr("transform", "translate(" + (edgeDepthB.get_x() * this.canvasWidth * (1 - this.edgeDepthX)) + ",0)")



                    edgeDepthG.select("#edgeDepthCircleIcon-" + edgeDepthB.get_depth().toString().replace(".", "-"))
                        .transition()
                        .duration(transitionDuration)
                        .attr("opacity", () => {
                            if (edgeDepthB.get_state() != State["Uncompressed"]) {
                                return "1"
                            } else {
                                return "0"
                            }
                        })
                        .attr("d", () => {
                            let curve = d3.line().curve(d3.curveBasisClosed)
                            if (edgeDepthB.get_state() == State["Singleton"]) {
                                return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                            }
                            if (edgeDepthB.get_state() == State["Partially Compressed"]) {
                                return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]])
                            } else if (edgeDepthB.get_state() == State["Fully Compressed"]) {
                                return curve([[0, 0.7], [-0.7, 0], [0, -0.7], [0.7, 0]])
                            } else if (edgeDepthB.get_state() == State["Uncompressed"]) {
                                return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                            }
                        });
                }
            }
        }

        this.globalDispatcher.on("compression.biofabric", compressionFn);

        this.globalDispatcher.on("hover-in.biofabric", (id) => {
            const n = this.biofabric.graph.nodes.find(n => n.get_id() === id);
            const incidentEdges = this.biofabric.graph.get_incident_edges(n);
            d3.selectAll(".edgeG").classed("fade-biofabric", edge => !incidentEdges.includes(edge));
            d3.selectAll(".nodeline").classed("fade-biofabric-light", node => !incidentEdges.some(edge => edge.has_node_id(node.get_id())));
            d3.selectAll(".nodetext").classed("fade-biofabric-light", node => !incidentEdges.some(edge => edge.has_node_id(node.get_id())));
        });

        this.globalDispatcher.on("hover-out.biofabric", () => {
            d3.selectAll(".edgeG").classed("fade-biofabric", false);
            d3.selectAll(".nodeline").classed("fade-biofabric-light", false);
            d3.selectAll(".nodetext").classed("fade-biofabric-light", false);
        });

        this.globalDispatcher.on("highlight.biofabric", (id) => {
            // equivalent to matrix highlighting.
            const n = this.biofabric.graph.nodes.find(n => n.get_id() === id);
            this.biofabric.highlight_unh_nodes(n);
            d3.selectAll(".edgecircle").classed("highlight-biofabric", d => d.get_highlighted());
            d3.selectAll(".nodeline").classed("highlight-biofabric", d => d.get_highlighted());
        });

        this.globalDispatcher.on("edge-hover-in.biofabric", (id) => {
            const e = this.biofabric.graph.edges.find(e => e.get_id() === id);
            d3.selectAll(".edgeG").classed("fade-biofabric", edge => edge.get_id() !== id);
            d3.selectAll(".nodeline").classed("fade-biofabric-light", node => !e.has_node_id(node.get_id()));
            d3.selectAll(".nodetext").classed("fade-biofabric-light", node => !e.has_node_id(node.get_id()));
        });

        this.globalDispatcher.on("edge-hover-out.biofabric", () => {
            d3.selectAll(".edgeG").classed("fade-biofabric", false);
            d3.selectAll(".nodeline").classed("fade-biofabric-light", false);
            d3.selectAll(".nodetext").classed("fade-biofabric-light", false);
        });
    }

    // Update
    update() {

    }
}
