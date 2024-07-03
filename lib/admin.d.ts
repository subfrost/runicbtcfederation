import { AddressReceivedRunesResponse } from "./proto/metashrew-runes";
export declare function decodeAddressReceivedRuneOutput(hex: string): AddressReceivedRunesResponse;
export declare function encodeAddressReceivedRuneOutput(height: number, address: string): string;
