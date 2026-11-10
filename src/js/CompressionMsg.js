export const NODE_COMPRESSION = "node_compression";
export const EDGE_COMPRESSION = "edge_compression";
export const UNCOMPRESS_ALL = "uncompress_all";
export const NODE_COMPRESS_FULL = "node_compress_full";
export const EDGE_COMPRESS_FULL = "edge_compress_full";
export const EDGE_COMPRESS_HALF = "edge_compress_half";

export class CompressionMsg {
    constructor(msg, compressionType = "") {
        this.msg = msg;
        this.compressionType = compressionType;
    }
}