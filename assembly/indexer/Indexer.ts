import { Box } from "metashrew-as/assembly/utils/box";
import { RunesBlock } from "./RunesBlock";
import { RunestoneMessage } from "./RunestoneMessage";
import { RunesTransaction } from "./RunesTransaction";
import { Block } from "metashrew-as/assembly/blockdata/block";
import { scriptParse } from "metashrew-as/assembly/utils/yabsp";
import { console } from "metashrew-as/assembly/utils/logging";
import { Field } from "./Field";
import {
  OUTPOINT_TO_HEIGHT,
  HEIGHT_TO_BLOCKHASH,
  BLOCKHASH_TO_HEIGHT,
  GENESIS,
} from "./constants";
import { OutPoint } from "metashrew-as/assembly/blockdata/transaction";
import { isEqualArrayBuffer, fieldToArrayBuffer } from "../utils";
import { encodeHexFromBuffer } from "metashrew-as/assembly/utils";

export class Index {
  static indexOutpoints(
    tx: RunesTransaction,
    txid: ArrayBuffer,
    height: u32,
  ): void {
    for (let i: i32 = 0; i < tx.outs.length; i++) {
      OUTPOINT_TO_HEIGHT.select(
        OutPoint.from(txid, <u32>i).toArrayBuffer(),
      ).setValue<u32>(height);
    }
  }
  static findCommitment(tx: RunesTransaction, height: u32): bool {
    for (let i = 0; i < tx.ins.length; i++) {
      const input = tx.ins[i];
      // check that there is 1 data push
      const inscription = input.inscription();
      if (changetype<usize>(inscription) === 0) continue;
      const commitment = inscription.field(5);
      for (let i = 0; i < inscription.fields.length; i++)
        console.log(inscription.fields[i].tag.toString());
      if (!commitment) continue;
      const previousOutpoint = tx.ins[i].previousOutput().toArrayBuffer();
      console.log(encodeHexFromBuffer(commitment));
      if (
        height - OUTPOINT_TO_HEIGHT.select(previousOutpoint).getValue<u32>() >=
        6
      ) {
        return true;
      }
    }
    return false;
  }
  static inspectTransaction(height: u32, _block: Block, txindex: u32): void {
    const block = changetype<RunesBlock>(_block);
    const tx = block.getTransaction(txindex);
    tx.processRunestones();

    const runestoneOutputIndex = tx.tags.runestone;
    const runestoneOutput = tx.outs[runestoneOutputIndex];
    const parsed = scriptParse(runestoneOutput.script).slice(2);
    if (
      parsed.findIndex((v: Box, i: i32, ary: Array<Box>) => {
        return v.start === usize.MAX_VALUE;
      }) !== -1
    )
      return;
    const payload = Box.concat(parsed);
    const message = RunestoneMessage.parse(payload);
    if (changetype<usize>(message) === 0) return;
    const name = new ArrayBuffer(0);
    const commitment = Index.findCommitment(tx, height);
    if (commitment) console.log("no commitment");
    else console.log("commitment found");
  }
  static indexBlock(height: u32, _block: Block): void {
    if (height == GENESIS) {
      RunestoneMessage.etchGenesisRune();
    }
    const block = changetype<RunesBlock>(_block);
    console.log("METASHREW_RUNES_LOG::indexing block: " + height.toString());
    HEIGHT_TO_BLOCKHASH.selectValue<u32>(height).set(block.blockhash());
    BLOCKHASH_TO_HEIGHT.select(block.blockhash()).setValue<u32>(height);
    block.saveTransactions(height);
    for (let i: i32 = 0; i < block.transactions.length; i++) {
      const tx = block.getTransaction(i);
      const txid = tx.txid();
      Index.indexOutpoints(tx, txid, height);
      tx.processRunestones();
      if (
        height >= GENESIS &&
        tx.tags.runestone !== -1 &&
        Index.findCommitment(tx, height)
      ) {
        const runestoneOutputIndex = tx.tags.runestone;
        const runestoneOutput = tx.outs[runestoneOutputIndex];
        const parsed = scriptParse(runestoneOutput.script).slice(2);
        if (
          parsed.findIndex((v: Box, i: i32, ary: Array<Box>) => {
            return v.start === usize.MAX_VALUE;
          }) !== -1
        )
          continue; // non-data push: cenotaph
        const payload = Box.concat(parsed);
        const message = RunestoneMessage.parse(payload);
        if (changetype<usize>(message) === 0) continue;

        //process message here
        message.process(tx, txid, height, i);
      }
    }
  }
}
