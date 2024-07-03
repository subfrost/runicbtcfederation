import { Box } from "metashrew-as/assembly/utils/box";
import { RunesBlock } from "./RunesBlock";
import { RunestoneMessage } from "./RunestoneMessage";
import { RunesTransaction } from "./RunesTransaction";
import { Block } from "metashrew-as/assembly/blockdata/block";
import { scriptParse } from "metashrew-as/assembly/utils/yabsp";
import { console } from "metashrew-as/assembly/utils/logging";
import {
  OUTPOINT_TO_HEIGHT,
  HEIGHT_TO_BLOCKHASH,
  BLOCKHASH_TO_HEIGHT,
  HEIGHT_TO_RECEIVED_BTC,
  HEIGHT_TO_RECEIVED_RUNE,
  GENESIS,
} from "./constants";
import { Input, OutPoint } from "metashrew-as/assembly/blockdata/transaction";
import {
  isEqualArrayBuffer,
  fieldToArrayBuffer,
  stripNullRight,
} from "../utils";
import { encodeHexFromBuffer } from "metashrew-as/assembly/utils";
import { metashrew_runes as protobuf } from "../proto/metashrew-runes";
import { OUTPOINT_SPENDABLE_BY } from "metashrew-spendables/assembly/tables";

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
  static findCommitment(
    name: ArrayBuffer,
    tx: RunesTransaction,
    height: u32,
  ): bool {
    for (let i = 0; i < tx.ins.length; i++) {
      const input = tx.ins[i];
      // check that there is 1 data push
      const inscription = input.inscription();

      if (changetype<usize>(inscription) === 0 || inscription == null) continue;
      const commitment = inscription.field(0);
      if (!commitment) continue;
      const previousOutpoint = tx.ins[i].previousOutput().toArrayBuffer();
      const previousOutpointHeight =
        OUTPOINT_TO_HEIGHT.select(previousOutpoint).getValue<u32>();
      if (height - previousOutpointHeight >= 6) return true;
    }
    return false;
  }
  static inspectTransaction(
    name: ArrayBuffer,
    height: u32,
    _block: Block,
    txindex: u32,
  ): void {
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
    const commitment = Index.findCommitment(stripNullRight(name), tx, height);
    /*
    if (commitment) console.log("no commitment");
    else console.log("commitment found");
   */
  }

  static getSenderAddress(tx: RunesTransaction): ArrayBuffer {
    // find sender addr
    for (let in_idx = 0; in_idx < tx.ins.length; in_idx++) {
      const input: Input = tx.ins[in_idx];
      const addr = OUTPOINT_SPENDABLE_BY.select(
        input.previousOutput().toArrayBuffer(),
      ).get();
      // send_addr = the first tx inputs sender with valid addr
      if (addr.byteLength != 0) {
        return addr;
      }
    }
    return new ArrayBuffer(0);
    // TODO: assert(senderAddr.byteLength != 0,"Unable to find sender address in tx");
  }

  static processRunesTransaction(
    tx: RunesTransaction,
    txid: ArrayBuffer,
    height: u32,
    i: u32,
  ): void {
    const senderAddr = this.getSenderAddress(tx);

    tx.processRunestones();
    if (height >= GENESIS && tx.tags.runestone !== -1) {
      const runestoneOutputIndex = tx.tags.runestone;
      const runestoneOutput = tx.outs[runestoneOutputIndex];
      const parsed = scriptParse(runestoneOutput.script).slice(2);
      if (
        parsed.findIndex((v: Box, i: i32, ary: Array<Box>) => {
          return v.start === usize.MAX_VALUE;
        }) !== -1
      )
        return; // non-data push: cenotaph
      const payload = Box.concat(parsed);
      const message = RunestoneMessage.parse(payload);
      if (changetype<usize>(message) === 0) return;

      //process message here
      message.process(tx, txid, height, i, senderAddr);

      const recvAddresses = message.receiptItems.keys();
      for (
        let map_idx: i32 = 0;
        map_idx < message.receiptItems.size;
        map_idx++
      ) {
        const recvAddr = recvAddresses[map_idx];
        const receiptItemProto = message.receiptItems.get(recvAddr);

        HEIGHT_TO_RECEIVED_RUNE.selectValue<u32>(height)
          .select(String.UTF8.encode(recvAddr))
          .append(receiptItemProto.encode());
      }
    }


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
      Index.processRunesTransaction(tx, txid, height, i);
    }
  }
}
