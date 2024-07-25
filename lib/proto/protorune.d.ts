import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protorune.RuneId
 */
export interface RuneId {
    /**
     * @generated from protobuf field: uint32 height = 1;
     */
    height: number;
    /**
     * @generated from protobuf field: uint32 txindex = 2;
     */
    txindex: number;
}
/**
 * @generated from protobuf message protorune.Rune
 */
export interface Rune {
    /**
     * @generated from protobuf field: protorune.RuneId runeId = 1;
     */
    runeId?: RuneId;
    /**
     * @generated from protobuf field: bytes name = 2;
     */
    name: Uint8Array;
    /**
     * @generated from protobuf field: uint32 divisibility = 3;
     */
    divisibility: number;
    /**
     * @generated from protobuf field: uint32 spacers = 4;
     */
    spacers: number;
    /**
     * @generated from protobuf field: uint32 symbol = 5;
     */
    symbol: number;
}
/**
 * @generated from protobuf message protorune.BalanceSheetItem
 */
export interface BalanceSheetItem {
    /**
     * @generated from protobuf field: protorune.Rune rune = 1;
     */
    rune?: Rune;
    /**
     * @generated from protobuf field: bytes balance = 2;
     */
    balance: Uint8Array;
}
/**
 * @generated from protobuf message protorune.BalanceSheet
 */
export interface BalanceSheet {
    /**
     * @generated from protobuf field: repeated protorune.BalanceSheetItem entries = 1;
     */
    entries: BalanceSheetItem[];
}
/**
 * @generated from protobuf message protorune.Outpoint
 */
export interface Outpoint {
    /**
     * @generated from protobuf field: bytes txid = 1;
     */
    txid: Uint8Array;
    /**
     * @generated from protobuf field: uint32 vout = 2;
     */
    vout: number;
}
/**
 * @generated from protobuf message protorune.OutpointWithProtocol
 */
export interface OutpointWithProtocol {
    /**
     * @generated from protobuf field: bytes txid = 1;
     */
    txid: Uint8Array;
    /**
     * @generated from protobuf field: uint32 vout = 2;
     */
    vout: number;
    /**
     * @generated from protobuf field: bytes protocol = 3;
     */
    protocol: Uint8Array;
}
/**
 * @generated from protobuf message protorune.Output
 */
export interface Output {
    /**
     * @generated from protobuf field: bytes script = 1;
     */
    script: Uint8Array;
    /**
     * @generated from protobuf field: uint64 value = 2;
     */
    value: bigint;
}
/**
 * @generated from protobuf message protorune.OutpointResponse
 */
export interface OutpointResponse {
    /**
     * @generated from protobuf field: protorune.BalanceSheet balances = 1;
     */
    balances?: BalanceSheet;
    /**
     * @generated from protobuf field: protorune.Outpoint outpoint = 2;
     */
    outpoint?: Outpoint;
    /**
     * @generated from protobuf field: protorune.Output output = 3;
     */
    output?: Output;
    /**
     * @generated from protobuf field: uint32 height = 4;
     */
    height: number;
    /**
     * @generated from protobuf field: uint32 txindex = 5;
     */
    txindex: number;
}
/**
 * @generated from protobuf message protorune.PaginationInput
 */
export interface PaginationInput {
    /**
     * @generated from protobuf field: uint32 start = 1;
     */
    start: number;
    /**
     * @generated from protobuf field: uint32 end = 2;
     */
    end: number;
}
/**
 * @generated from protobuf message protorune.WalletRequest
 */
export interface WalletRequest {
    /**
     * @generated from protobuf field: bytes wallet = 1;
     */
    wallet: Uint8Array;
}
/**
 * @generated from protobuf message protorune.WalletResponse
 */
export interface WalletResponse {
    /**
     * @generated from protobuf field: repeated protorune.OutpointResponse outpoints = 1;
     */
    outpoints: OutpointResponse[];
    /**
     * @generated from protobuf field: protorune.BalanceSheet balances = 2;
     */
    balances?: BalanceSheet;
}
/**
 * @generated from protobuf message protorune.ProtorunesWalletRequest
 */
export interface ProtorunesWalletRequest {
    /**
     * @generated from protobuf field: bytes wallet = 1;
     */
    wallet: Uint8Array;
    /**
     * @generated from protobuf field: bytes protocol_tag = 2;
     */
    protocolTag: Uint8Array;
}
/**
 * @generated from protobuf message protorune.RunesResponse
 */
export interface RunesResponse {
    /**
     * @generated from protobuf field: repeated protorune.Rune runes = 1;
     */
    runes: Rune[];
}
/**
 * @generated from protobuf message protorune.ProtoBurn
 */
export interface ProtoBurn {
    /**
     * @generated from protobuf field: bytes protocol_tag = 1;
     */
    protocolTag: Uint8Array;
    /**
     * @generated from protobuf field: uint32 pointer = 2;
     */
    pointer: number;
}
/**
 * @generated from protobuf message protorune.uint128
 */
export interface uint128 {
    /**
     * @generated from protobuf field: uint64 lo = 1;
     */
    lo: bigint;
    /**
     * @generated from protobuf field: uint64 hi = 2;
     */
    hi: bigint;
}
/**
 * @generated from protobuf message protorune.Clause
 */
export interface Clause {
    /**
     * @generated from protobuf field: protorune.RuneId rune = 1;
     */
    rune?: RuneId;
    /**
     * @generated from protobuf field: protorune.uint128 amount = 2;
     */
    amount?: uint128;
}
/**
 * @generated from protobuf message protorune.Predicate
 */
export interface Predicate {
    /**
     * @generated from protobuf field: repeated protorune.Clause clauses = 1;
     */
    clauses: Clause[];
}
/**
 * @generated from protobuf message protorune.ProtoMessage
 */
export interface ProtoMessage {
    /**
     * @generated from protobuf field: bytes calldata = 1;
     */
    calldata: Uint8Array;
    /**
     * @generated from protobuf field: protorune.Predicate predicate = 2;
     */
    predicate?: Predicate;
    /**
     * @generated from protobuf field: uint32 pointer = 3;
     */
    pointer: number;
    /**
     * @generated from protobuf field: uint32 refund_pointer = 4;
     */
    refundPointer: number;
}
/**
 * @generated from protobuf message protorune.AddressReceivedAmount
 */
export interface AddressReceivedAmount {
    /**
     * @generated from protobuf field: string senderAddress = 1;
     */
    senderAddress: string;
    /**
     * @generated from protobuf field: bytes amount = 2;
     */
    amount: Uint8Array;
}
/**
 * @generated from protobuf message protorune.AddressReceivedReceipt
 */
export interface AddressReceivedReceipt {
    /**
     * @generated from protobuf field: protorune.RuneId runeId = 1;
     */
    runeId?: RuneId;
    /**
     * @generated from protobuf field: repeated protorune.AddressReceivedAmount amounts = 2;
     */
    amounts: AddressReceivedAmount[];
}
/**
 * @generated from protobuf message protorune.AddressReceivedRunesRequest
 */
export interface AddressReceivedRunesRequest {
    /**
     * @generated from protobuf field: uint32 height = 1;
     */
    height: number;
    /**
     * @generated from protobuf field: bytes address = 2;
     */
    address: Uint8Array;
}
/**
 * @generated from protobuf message protorune.AddressReceivedRunesResponse
 */
export interface AddressReceivedRunesResponse {
    /**
     * @generated from protobuf field: repeated protorune.AddressReceivedReceipt receipts = 1;
     */
    receipts: AddressReceivedReceipt[];
}
declare class RuneId$Type extends MessageType<RuneId> {
    constructor();
    create(value?: PartialMessage<RuneId>): RuneId;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RuneId): RuneId;
    internalBinaryWrite(message: RuneId, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.RuneId
 */
export declare const RuneId: RuneId$Type;
declare class Rune$Type extends MessageType<Rune> {
    constructor();
    create(value?: PartialMessage<Rune>): Rune;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Rune): Rune;
    internalBinaryWrite(message: Rune, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.Rune
 */
export declare const Rune: Rune$Type;
declare class BalanceSheetItem$Type extends MessageType<BalanceSheetItem> {
    constructor();
    create(value?: PartialMessage<BalanceSheetItem>): BalanceSheetItem;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: BalanceSheetItem): BalanceSheetItem;
    internalBinaryWrite(message: BalanceSheetItem, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.BalanceSheetItem
 */
export declare const BalanceSheetItem: BalanceSheetItem$Type;
declare class BalanceSheet$Type extends MessageType<BalanceSheet> {
    constructor();
    create(value?: PartialMessage<BalanceSheet>): BalanceSheet;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: BalanceSheet): BalanceSheet;
    internalBinaryWrite(message: BalanceSheet, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.BalanceSheet
 */
export declare const BalanceSheet: BalanceSheet$Type;
declare class Outpoint$Type extends MessageType<Outpoint> {
    constructor();
    create(value?: PartialMessage<Outpoint>): Outpoint;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Outpoint): Outpoint;
    internalBinaryWrite(message: Outpoint, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.Outpoint
 */
export declare const Outpoint: Outpoint$Type;
declare class OutpointWithProtocol$Type extends MessageType<OutpointWithProtocol> {
    constructor();
    create(value?: PartialMessage<OutpointWithProtocol>): OutpointWithProtocol;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: OutpointWithProtocol): OutpointWithProtocol;
    internalBinaryWrite(message: OutpointWithProtocol, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.OutpointWithProtocol
 */
export declare const OutpointWithProtocol: OutpointWithProtocol$Type;
declare class Output$Type extends MessageType<Output> {
    constructor();
    create(value?: PartialMessage<Output>): Output;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Output): Output;
    internalBinaryWrite(message: Output, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.Output
 */
export declare const Output: Output$Type;
declare class OutpointResponse$Type extends MessageType<OutpointResponse> {
    constructor();
    create(value?: PartialMessage<OutpointResponse>): OutpointResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: OutpointResponse): OutpointResponse;
    internalBinaryWrite(message: OutpointResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.OutpointResponse
 */
export declare const OutpointResponse: OutpointResponse$Type;
declare class PaginationInput$Type extends MessageType<PaginationInput> {
    constructor();
    create(value?: PartialMessage<PaginationInput>): PaginationInput;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PaginationInput): PaginationInput;
    internalBinaryWrite(message: PaginationInput, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.PaginationInput
 */
export declare const PaginationInput: PaginationInput$Type;
declare class WalletRequest$Type extends MessageType<WalletRequest> {
    constructor();
    create(value?: PartialMessage<WalletRequest>): WalletRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: WalletRequest): WalletRequest;
    internalBinaryWrite(message: WalletRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.WalletRequest
 */
export declare const WalletRequest: WalletRequest$Type;
declare class WalletResponse$Type extends MessageType<WalletResponse> {
    constructor();
    create(value?: PartialMessage<WalletResponse>): WalletResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: WalletResponse): WalletResponse;
    internalBinaryWrite(message: WalletResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.WalletResponse
 */
export declare const WalletResponse: WalletResponse$Type;
declare class ProtorunesWalletRequest$Type extends MessageType<ProtorunesWalletRequest> {
    constructor();
    create(value?: PartialMessage<ProtorunesWalletRequest>): ProtorunesWalletRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ProtorunesWalletRequest): ProtorunesWalletRequest;
    internalBinaryWrite(message: ProtorunesWalletRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.ProtorunesWalletRequest
 */
export declare const ProtorunesWalletRequest: ProtorunesWalletRequest$Type;
declare class RunesResponse$Type extends MessageType<RunesResponse> {
    constructor();
    create(value?: PartialMessage<RunesResponse>): RunesResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RunesResponse): RunesResponse;
    internalBinaryWrite(message: RunesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.RunesResponse
 */
export declare const RunesResponse: RunesResponse$Type;
declare class ProtoBurn$Type extends MessageType<ProtoBurn> {
    constructor();
    create(value?: PartialMessage<ProtoBurn>): ProtoBurn;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ProtoBurn): ProtoBurn;
    internalBinaryWrite(message: ProtoBurn, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.ProtoBurn
 */
export declare const ProtoBurn: ProtoBurn$Type;
declare class uint128$Type extends MessageType<uint128> {
    constructor();
    create(value?: PartialMessage<uint128>): uint128;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: uint128): uint128;
    internalBinaryWrite(message: uint128, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.uint128
 */
export declare const uint128: uint128$Type;
declare class Clause$Type extends MessageType<Clause> {
    constructor();
    create(value?: PartialMessage<Clause>): Clause;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Clause): Clause;
    internalBinaryWrite(message: Clause, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.Clause
 */
export declare const Clause: Clause$Type;
declare class Predicate$Type extends MessageType<Predicate> {
    constructor();
    create(value?: PartialMessage<Predicate>): Predicate;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Predicate): Predicate;
    internalBinaryWrite(message: Predicate, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.Predicate
 */
export declare const Predicate: Predicate$Type;
declare class ProtoMessage$Type extends MessageType<ProtoMessage> {
    constructor();
    create(value?: PartialMessage<ProtoMessage>): ProtoMessage;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ProtoMessage): ProtoMessage;
    internalBinaryWrite(message: ProtoMessage, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.ProtoMessage
 */
export declare const ProtoMessage: ProtoMessage$Type;
declare class AddressReceivedAmount$Type extends MessageType<AddressReceivedAmount> {
    constructor();
    create(value?: PartialMessage<AddressReceivedAmount>): AddressReceivedAmount;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddressReceivedAmount): AddressReceivedAmount;
    internalBinaryWrite(message: AddressReceivedAmount, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.AddressReceivedAmount
 */
export declare const AddressReceivedAmount: AddressReceivedAmount$Type;
declare class AddressReceivedReceipt$Type extends MessageType<AddressReceivedReceipt> {
    constructor();
    create(value?: PartialMessage<AddressReceivedReceipt>): AddressReceivedReceipt;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddressReceivedReceipt): AddressReceivedReceipt;
    internalBinaryWrite(message: AddressReceivedReceipt, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.AddressReceivedReceipt
 */
export declare const AddressReceivedReceipt: AddressReceivedReceipt$Type;
declare class AddressReceivedRunesRequest$Type extends MessageType<AddressReceivedRunesRequest> {
    constructor();
    create(value?: PartialMessage<AddressReceivedRunesRequest>): AddressReceivedRunesRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddressReceivedRunesRequest): AddressReceivedRunesRequest;
    internalBinaryWrite(message: AddressReceivedRunesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.AddressReceivedRunesRequest
 */
export declare const AddressReceivedRunesRequest: AddressReceivedRunesRequest$Type;
declare class AddressReceivedRunesResponse$Type extends MessageType<AddressReceivedRunesResponse> {
    constructor();
    create(value?: PartialMessage<AddressReceivedRunesResponse>): AddressReceivedRunesResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AddressReceivedRunesResponse): AddressReceivedRunesResponse;
    internalBinaryWrite(message: AddressReceivedRunesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protorune.AddressReceivedRunesResponse
 */
export declare const AddressReceivedRunesResponse: AddressReceivedRunesResponse$Type;
export {};
