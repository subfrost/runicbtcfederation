export type ReceivedAmount = {
    senderAddress: string;
    amount: BigInt;
};
export type Receipt = {
    id: string;
    amounts: ReceivedAmount[];
};
export declare function decodeAddressReceivedRuneOutput(hex: string): Receipt[];
export declare function encodeAddressReceivedRuneOutput(height: number, address: string): string;
