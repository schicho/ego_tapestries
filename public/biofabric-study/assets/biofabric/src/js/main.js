//import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// loaded from local file in index.html
import { Graph } from './graph.js';
import { BioFabric } from './biofabric.js';
import { BioFabricRenderer } from './biofabricrenderer.js';
import { State } from './state.js';

const state = {
    width: 100,
    height: 45, // less tall, since the depth icons on top are hidden
    dataPath: "./data/company-network.json",
    graph: null,
    rendererOptions: {},
    // "partial": edges that start at the same node share one column (collapsed edges)
    edgeCompression: null,
    svg: null,
};

// Reference sizes: the smallest of the large graphs of the study. Graphs with fewer nodes or
// edges are drawn on a proportionally smaller canvas, so that the spacing of the node lines
// and edges, and the size of the circles, look similar to the large graphs. Graphs of at
// least this size are drawn as before.
const REFERENCE_NODE_COUNT = 72;
const REFERENCE_EDGE_COUNT = 110;
// Share of the default width that is reserved for the node labels
const LABEL_COLUMN_SHARE = 0.12;

function getOrCreateSvg(width, height) {
    let svg = d3.select("#something");
    if (svg.empty()) {
        svg = d3
            .select("body")
            .append("svg")
            .attr("id", "something")
            .attr("width", "100%")
            .attr("height", "100%");
    }

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    return svg;
}

function render() {
    if (!state.graph) return;

    // Collapsed edges condition: fixed view in which edges that start at the same node share a column
    const collapseEdges = state.edgeCompression === "partial";
    state.graph.edges.forEach(edge => {
        edge.set_state(collapseEdges ? State["Partially Compressed"] : State.Uncompressed);
    });
    const biofabric = new BioFabric(state.graph);

    // Number of columns the edges are drawn in (the number of edges, unless edges are collapsed)
    const columnCount = new Set(state.graph.edges.map(edge => edge.get_x())).size;

    // The label column keeps its size, the rest of the canvas shrinks for smaller graphs
    const nodeScale = Math.min(1, state.graph.nodes.length / REFERENCE_NODE_COUNT);
    const columnScale = Math.min(1, columnCount / REFERENCE_EDGE_COUNT);
    const labelColumnWidth = state.width * LABEL_COLUMN_SHARE;
    const width = labelColumnWidth + (state.width - labelColumnWidth) * columnScale;
    const height = state.height * nodeScale;

    state.svg = getOrCreateSvg(width, height);
    state.svg.selectAll("*").remove();

    const renderer = new BioFabricRenderer(biofabric, width, height, undefined, {
        ...state.rendererOptions,
        labelColumnWidth,
        // edge lines and circles are as thick as in the large graphs, also for smaller graphs
        edgeSizeDivisor: Math.max(state.graph.edges.length, REFERENCE_EDGE_COUNT),
    });
    renderer.render(state.svg);
}

async function loadGraph(dataPath = state.dataPath) {
    state.dataPath = dataPath;
    const data = await d3.json(state.dataPath);
    state.graph = new Graph(data);
}

async function init(options = {}) {
    if (options.width != null) state.width = options.width;
    if (options.height != null) state.height = options.height;
    if (options.dataPath != null) state.dataPath = options.dataPath;
    state.edgeCompression = options.edgeCompression ?? null;
    state.rendererOptions = {
        visibleLabels: options.visibleLabels,
        labelFontSize: options.labelFontSize,
        preselectedLabels: options.preselectedLabels,
        hideDepthIcons: options.hideDepthIcons,
        selectionDisabled: options.selectionDisabled,
    };

    await loadGraph(state.dataPath);
    render();
}

export {
    init,
    render,
    loadGraph,
};
