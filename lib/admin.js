"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAddressReceivedRuneOutput = decodeAddressReceivedRuneOutput;
exports.encodeAddressReceivedRuneOutput = encodeAddressReceivedRuneOutput;
const metashrew_runes_1 = require("./proto/metashrew-runes");
function decodeAddressReceivedRuneOutput(hex) {
    return metashrew_runes_1.AddressReceivedRunesResponse.fromBinary(Uint8Array.from(Buffer.from(hex, "hex")));
}
function encodeAddressReceivedRuneOutput(height, address) {
    const input = {
        height: height,
        address: Uint8Array.from(Buffer.from(address, "utf-8")),
    };
    return "0x" + Buffer.from(metashrew_runes_1.AddressReceivedRunesRequest.toBinary(input)).toString("hex");
}
//# sourceMappingURL=admin.js.map