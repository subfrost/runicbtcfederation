import * as admin from "./admin";
import { OutPoint, RuneOutput } from "metashrew-runes/lib/src.ts/outpoint";
import { MetashrewRunes } from "metashrew-runes/lib/src.ts/rpc";
export declare class ProtorunesRpc extends MetashrewRunes {
    protorunesbyaddress({ address, protocolTag }: any): Promise<{
        outpoints: OutPoint[];
        balanceSheet: RuneOutput[];
    }>;
    getAllRuneDeposits({ height, address, }: any): Promise<admin.Receipt[]>;
}
