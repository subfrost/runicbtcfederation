"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAddressReceivedRuneOutput = decodeAddressReceivedRuneOutput;
exports.encodeAddressReceivedRuneOutput = encodeAddressReceivedRuneOutput;
const protorune_1 = require("./proto/protorune");
const utils_1 = require("./utils");
function decodeReceiptAmount(amount) {
    return {
        senderAddress: amount.senderAddress,
        amount: BigInt("0x" + Buffer.from(amount.amount).toString("hex"))
    };
}
function decodeAddressReceivedReceipt(receipt) {
    return {
        id: `${receipt.runeId.height}:${receipt.runeId.txindex}`,
        amounts: receipt.amounts.map((amount) => decodeReceiptAmount(amount))
    };
}
function decodeAddressReceivedRuneOutput(hex) {
    const recvResponse = protorune_1.AddressReceivedRunesResponse.fromBinary(Uint8Array.from(Buffer.from((0, utils_1.stripHexPrefix)(hex), "hex")));
    return recvResponse.receipts.map((receipt) => decodeAddressReceivedReceipt(receipt));
}
function encodeAddressReceivedRuneOutput(height, address) {
    const input = {
        height: height,
        address: Uint8Array.from(Buffer.from(address, "utf-8")),
    };
    return "0x" + Buffer.from(protorune_1.AddressReceivedRunesRequest.toBinary(input)).toString("hex");
}
//# sourceMappingURL=admin.js.map