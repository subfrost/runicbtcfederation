import { Block }  from "metashrew-as/assembly/blockdata/block";
import { Input, Output } from "metashrew-as/assembly/blockdata/transaction";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { OUTPOINT_TO_OUTPUT } from "metashrew-spendables/assembly/tables";
import { bytesToOutput } from "metashrew-spendables/assembly/indexer"
import { PAYMENTS_TABLE } from "./tables/tables";
import { Script } from "metashrew-as/assembly/utils/yabsp";
import { Address } from "metashrew-as/assembly/blockdata/address";

export class Index {
    static indexBlock(height: u32, block: Block){
        for (let i = 0; i < block.transactions.length; i++){
            const tx = block.transactions[i];
            let inputs = tx.ins;
            let input_idx = 0;
            // amts are 1:1 with inputs
            let input_amts = this.getInputAmounts(inputs);
            for (let j = 0; j < tx.outs.length; j++){
                const output = tx.outs[j];
                let amt_remaining = output.value;
                while (amt_remaining > 0 && input_idx < inputs.length){ 
                    const curr = inputs[input_idx];
                    const amt = input_amts[input_idx];
                    const diff = amt - amt_remaining;
                    // if the input amt covers the entire amt of the output, then  
                    if(diff > 0) {
                        amt_remaining = 0;
                        input_amts[input_idx] = diff;
                    } else if (diff < 0) {
                        // we have used up all the sats in the current input, we can move to the next one
                        amt_remaining -= amt;
                        input_amts[input_idx] = 0;
                        input_idx++;
                    }
                    // it should never equal zero because there must be excess to pay for fees
                    // now we can save the payment
                    const inputAddr = Address.from(Script.from(curr.script));
                    const recipientPointer = PAYMENTS_TABLE.selectValue<u32>(height).keyword("/").select(output.intoAddress() as ArrayBuffer);
                    const ptr = recipientPointer.keyword("/").select(inputAddr as ArrayBuffer);
                    if(ptr.length() == 0){
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
        for (let i = 0; i < inputs.length; i++){
            const prev_out = inputs[i].previousOutput().toArrayBuffer();
            const output = OUTPOINT_TO_OUTPUT.select(prev_out).unwrap();
            amts[i] = bytesToOutput(output).value;
        }
        return amts;
    }
}  