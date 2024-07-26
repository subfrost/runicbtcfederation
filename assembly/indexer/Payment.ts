import { Block } from "metashrew-as/assembly/blockdata/block";
import { Input, Output } from "metashrew-as/assembly/blockdata/transaction";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { OUTPOINT_TO_OUTPUT } from "metashrew-spendables/assembly/tables";

import { PAYMENTS_TABLE } from "./tables/tables";
import { Script } from "metashrew-as/assembly/utils/yabsp";
import { Address } from "metashrew-as/assembly/blockdata/address";
import { Box } from "metashrew-as/assembly/utils/box";

function intoAddress(output: Output): ArrayBuffer {
  const address = output.intoAddress();
  if (address === null) return String.UTF8.encode("UNSPENDABLE");
  return address as ArrayBuffer;
}

export function bytesToOutput(v: ArrayBuffer): Output {
  const output = new Output(Box.from(v));
  return output;
}

export class PaymentsIndex {
  static indexBlock(height: u32, block: Block) {
    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];
      let inputs = tx.ins;
      let inputIndex = 0;
      // amts are 1:1 with inputs
      let inputAmounts = this.getInputAmounts(inputs);
      for (let j = 0; j < tx.outs.length; j++) {
        const output = tx.outs[j];
        let amountRemaining = output.value;
        while (amountRemaining > 0 && inputIndex < inputs.length) {
          const curr = inputs[inputIndex];
          const amt = inputAmounts[inputIndex];
          const diff = amt - amountRemaining;
          // if the input amt covers the entire amt of the output, then
          if (diff > 0) {
            amountRemaining = 0;
            inputAmounts[inputIndex] = diff;
          } else if (diff < 0) {
            // we have used up all the sats in the current input, we can move to the next one
            amountRemaining -= amt;
            inputAmounts[inputIndex] = 0;
            inputIndex++;
          }
          // it should never equal zero because there must be excess to pay for fees
          // now we can save the payment
          const inputAddr = intoAddress(
            bytesToOutput(
              OUTPOINT_TO_OUTPUT.select(
                curr.previousOutput().toArrayBuffer(),
              ).unwrap(),
            ),
          );
          const recipientPointer = PAYMENTS_TABLE.selectValue<u32>(height)
            .keyword("/")
            .select(intoAddress(output));
          const ptr = recipientPointer
            .keyword("/")
            .select(inputAddr as ArrayBuffer);
          if (ptr.length() == 0) {
            recipientPointer.append(inputAddr as ArrayBuffer);
          }
          ptr.appendValue<u64>(output.value);
        }
      }
    }
  }
  // provide the amount of sats in each input by using previous output
  static getInputAmounts(inputs: Input[]): Array<u64> {
    let amts = new Array<u64>(inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      const prev_out = inputs[i].previousOutput().toArrayBuffer();
      const output = OUTPOINT_TO_OUTPUT.select(prev_out).unwrap();
      amts[i] = bytesToOutput(output).value;
    }
    return amts;
  }
}
