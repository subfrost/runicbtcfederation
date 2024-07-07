// This contains all view functions that the subfrost admin needs to
// fulfill transactions to the multisig

import { protorune as protobuf } from "../proto/protorune";
import { input } from "metashrew-as/assembly/indexer";
import { HEIGHT_TO_RECEIVED_RUNE } from "../indexer/constants";
import { console } from "metashrew-as/assembly/utils/logging";

export function getAllRuneDeposits(): ArrayBuffer {
  const decodedInput = protobuf.AddressReceivedRunesRequest.decode(
    input().slice(4),
  );
  const height = decodedInput.height;
  const _address = decodedInput.address;
  const address = changetype<Uint8Array>(_address).buffer;

  const depositsIndexPtr = HEIGHT_TO_RECEIVED_RUNE.selectValue<u32>(height)
    .keyword("/")
    .select(address);

  const numDeposits = depositsIndexPtr.length();

  const allReceipts = new Array<protobuf.AddressReceivedReceipt>();
  for (let i: u32 = 0; i < numDeposits; i++) {
    const receipt = depositsIndexPtr.selectIndex(i).get();
    allReceipts.push(protobuf.AddressReceivedReceipt.decode(receipt));
  }

  const message = new protobuf.AddressReceivedRunesResponse();
  message.receipts = allReceipts;

  return message.encode();
}
