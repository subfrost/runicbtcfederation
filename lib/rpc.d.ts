import { OutPoint, RuneOutput } from "./outpoint";
import { AddressReceivedRunesResponse } from "./proto/metashrew-runes";
export declare class MetashrewRunes {
    baseUrl: string;
    blockTag: string;
    constructor({ baseUrl, blockTag }: any);
    _call({ method, input }: {
        method: any;
        input: any;
    }): Promise<string>;
    runesbyaddress({ address }: any): Promise<{
        outpoints: OutPoint[];
        balanceSheet: RuneOutput[];
    }>;
    getAllRuneDeposits({ height, address, }: any): Promise<AddressReceivedRunesResponse>;
}
