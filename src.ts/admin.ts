import { AddressReceivedRunesRequest, AddressReceivedRunesResponse } from "./proto/metashrew-runes";

export function decodeAddressReceivedRuneOutput(hex: string): AddressReceivedRunesResponse {
  return AddressReceivedRunesResponse.fromBinary(
    Uint8Array.from(Buffer.from(hex, "hex"))
  );
}

export function encodeAddressReceivedRuneOutput(height: number, address: string) {
  const input: AddressReceivedRunesRequest = {
    height: height,
    address: Uint8Array.from(Buffer.from(address, "utf-8")),
  };
  return "0x" + Buffer.from(AddressReceivedRunesRequest.toBinary(input)).toString("hex");
}
