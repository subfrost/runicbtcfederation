import { AddressReceivedAmount, AddressReceivedReceipt, AddressReceivedRunesRequest, AddressReceivedRunesResponse, WalletResponse } from "./proto/protorune";
import { stripHexPrefix } from "./utils";

export type ReceivedAmount = {
  senderAddress: string;
  amount: BigInt;
}

export type Receipt = {
  id: string;
  amounts: ReceivedAmount[];
}

function decodeReceiptAmount(amount: AddressReceivedAmount): ReceivedAmount {
  return {
    senderAddress: amount.senderAddress,
    amount: BigInt("0x" + Buffer.from(amount.amount).toString("hex"))
  }
}

function decodeAddressReceivedReceipt(receipt: AddressReceivedReceipt): Receipt {
  return {
    id: `${receipt.runeId.height}:${receipt.runeId.txindex}`,
    amounts: receipt.amounts.map((amount) => decodeReceiptAmount(amount))
  }
}

export function decodeAddressReceivedRuneOutput(hex: string): Receipt[] {
  const recvResponse = AddressReceivedRunesResponse.fromBinary(
    Uint8Array.from(Buffer.from(stripHexPrefix(hex), "hex"))
  );

  return recvResponse.receipts.map((receipt) => decodeAddressReceivedReceipt(receipt))
}

export function encodeAddressReceivedRuneOutput(height: number, address: string) {
  const input: AddressReceivedRunesRequest = {
    height: height,
    address: Uint8Array.from(Buffer.from(address, "utf-8")),
  };
  return "0x" + Buffer.from(AddressReceivedRunesRequest.toBinary(input)).toString("hex");
}