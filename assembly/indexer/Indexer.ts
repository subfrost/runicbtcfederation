import { Box } from "metashrew-as/assembly/utils/box";
import { RunesBlock } from "./RunesBlock";
import { RunestoneMessage } from "./RunestoneMessage";
import { ProtoruneMessage } from "./ProtoruneMessage";
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
import { PROTOCOL_TAG } from "./constants/protorune";
import {
  OutPoint,
  Output,
  Input,
} from "metashrew-as/assembly/blockdata/transaction";
import { protorune } from "../proto/protorune";
import { stripNullRight } from "../utils";
import { encodeHexFromBuffer } from "metashrew-as/assembly/utils";
import { ProtoMessage, MessageContext } from "../protomessage";
import { BalanceSheet } from "./BalanceSheet";
import { ProtoStone } from "./ProtoStone";
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

  static getMessagePayload(output: Output, skip: u32 = 2): ArrayBuffer {
    const parsed = scriptParse(output.script).slice(skip);
    if (
      parsed.findIndex((v: Box, i: i32, ary: Array<Box>) => {
        return v.start === usize.MAX_VALUE;
      }) !== -1
    )
      return new ArrayBuffer(0);
    return Box.concat(parsed);
  }

  static processMessage<T>(
    height: u64,
    tx: RunesTransaction,
    txid: ArrayBuffer,
    txindex: u32,
    outputIndex: i32,
  ): Map<u32, BalanceSheet> {
    if (outputIndex > -1) {
      const runestoneOutput = tx.outs[outputIndex];
      const payload = Index.getMessagePayload(runestoneOutput);
      if (changetype<usize>(payload) == 0) return new Map<u32, BalanceSheet>();
      const message = RunestoneMessage.parse(payload);
      if (changetype<usize>(message) === 0) return new Map<u32, BalanceSheet>();

      changetype<T>(message).getSenderAddress(tx);
      //process message here
      //@ts-ignore
      changetype<T>(message).process(tx, txid, <u32>height, txindex);

      const recvAddresses = message.receiptItems.keys();
      for (
        let map_idx: i32 = 0;
        map_idx < message.receiptItems.size;
        map_idx++
      ) {
        const recvAddr = recvAddresses[map_idx];
        const receiptItemProto = message.receiptItems.get(recvAddr);

        HEIGHT_TO_RECEIVED_RUNE.selectValue<u32>(<u32>height)
          .keyword("/")
          .select(String.UTF8.encode(recvAddr))
          .append(receiptItemProto.encode());
      }
    }
    return new Map<u32, BalanceSheet>();
  }
  static parseProtosplit(
    tx: RunesTransaction,
    startOutpoint: u32,
    message: ArrayBuffer,
  ): ArrayBuffer {
    const payload = Index.getMessagePayload(tx.outs[startOutpoint]);
    if (changetype<usize>(payload) == 0) return message;
    const protostone = ProtoStone.parse(payload);
    if (changetype<usize>(protostone) == 0)
      Box.concat([Box.from(message), Box.from(payload)]);
    const splits = protostone.splits();
    if (splits.length > 0) {
      for (let i = 0; i < splits.length; i++) {
        return Index.parseProtosplit(tx, splits[i], message);
      }
    }
    return message;
  }

  static processRunesTransaction(
    _block: Block,
    tx: RunesTransaction,
    txid: ArrayBuffer,
    height: u32,
    i: u32,
  ): void {
    tx.processRunestones();
    if (height >= GENESIS) {
      Index.processMessage<RunestoneMessage>(
        height,
        tx,
        txid,
        i,
        tx.tags.runestone,
      );

      const sheets = Index.processMessage<ProtoruneMessage>(
        height,
        tx,
        txid,
        i,
        tx.tags.protorunestone,
      );

      const protoMessages: Map<u16, ProtoMessage> = new Map<
        u16,
        ProtoMessage
      >();
      // parse protomessages
      const protomessageKeys = tx.tags.protomessage.keys();
      for (let m = 0; m < protomessageKeys.length; m++) {
        const index = tx.tags.protomessage[protomessageKeys[m]];
        const out = tx.outs[index];
        const parsed = scriptParse(out.script).slice(2);
        const message = protorune.ProtoMessage.decode(Box.concat(parsed));
        protoMessages.set(
          protomessageKeys[m],
          new ProtoMessage(message, index, sheets),
        );
      }

      //parse protosplit
      const protosplitKeys = tx.tags.protosplits.keys();
      const protoSplitData = new Map<u16, ArrayBuffer>();
      for (let k = 0; k < protosplitKeys.length; k++) {
        const outs = tx.tags.protosplits.get(protosplitKeys[k]);
        let message = new ArrayBuffer(0);
        for (let o = 0; o < outs.length; o++) {
          message = Box.concat([
            Box.from(message),
            Box.from(Index.parseProtosplit(tx, outs[o], message)),
          ]);
        }
        protoSplitData.set(protosplitKeys[k], message);
      }

      // process protomessage
      const protoMessageTypes = protoMessages.keys();
      for (let m = 0; m < protoMessageTypes.length; m++) {
        const message = protoMessages.get(protoMessageTypes[m]);
        message.handle<MessageContext>(tx, _block, height, i);
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
      Index.processRunesTransaction(_block, tx, txid, height, i);
    }
  }
}
