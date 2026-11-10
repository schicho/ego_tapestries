export const NODE_COMPRESSION = "node_compression";
export const EDGE_COMPRESSION = "edge_compression";

export const ALL_UNCOMPRESS = "all_uncompress";

export const ALL_NODE_COMPRESS_FULL = "all_node_compress_full";

export const ALL_EDGE_COMPRESS_FULL = "all_edge_compress_full";
export const ALL_EDGE_COMPRESS_HALF = "all_edge_compress_half";

export class CompressionMsg {
    constructor(msg, compressionType = "") {
        this.msg = msg;
        this.compressionType = compressionType;
    }
}