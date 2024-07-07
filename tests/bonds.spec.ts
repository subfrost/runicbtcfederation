import { expect } from "chai";
import path from "path";

//@ts-ignore
import bitcoinjs = require("bitcoinjs-lib");
import {
  TEST_BTC_ADDRESS1,
  TEST_BTC_ADDRESS2,
  buildProgram,
  formatKv,
} from "./utils/general";
import {
  initCompleteBlockWithRuneEtching,
  transferRune,
  getAllRuneDeposits,
  runesbyaddress,
} from "./utils/rune-helpers";

describe("metashrew-runes", () => {
  it("should determine that an address received runes", async () => {
    const SENDER_ADDRESS = TEST_BTC_ADDRESS1;
    const RECV_ADDRESS = TEST_BTC_ADDRESS2;
    const program = buildProgram();
    const height = 840000;
    program.setBlockHeight(height);
    const premineAmount = 2100000005000000n;
    const outputs = [
      {
        script: bitcoinjs.payments.p2pkh({
          address: SENDER_ADDRESS,
          network: bitcoinjs.networks.bitcoin,
        }).output,
        value: 1,
      },
      {
        script: bitcoinjs.payments.p2pkh({
          network: bitcoinjs.networks.bitcoin,
          address: RECV_ADDRESS,
        }).output,
        value: 624999999,
      },
    ];
    const pointer1 = 1;
    let block = initCompleteBlockWithRuneEtching(
      outputs,
      pointer1,
      undefined,
      premineAmount,
    );

    const input = {
      inputTxHash: block.transactions?.at(1)?.getHash(), // 0 is coinbase, 1 is the mint
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    };
    const runeId = {
      block: 840000n,
      tx: 1,
    };
    const amount = premineAmount / 2n;
    const outputIndexToReceiveRunes = 1; // 0 is the script
    const output = {
      address: RECV_ADDRESS,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    };
    const refundOutput = {
      address: SENDER_ADDRESS,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    };
    const outputRunePointer = 1; // leftover amount should go to output 1, so output 1 should have ALL premine runes

    block = transferRune(
      [input],
      runeId,
      amount,
      outputIndexToReceiveRunes,
      [output, refundOutput],
      outputRunePointer,
      block,
    );

    program.setBlock(block.toHex());

    await program.run("_start");

    const deposits = await getAllRuneDeposits(program, height, RECV_ADDRESS);
    expect(deposits[0].id).equals("840000:1", "Incorrect runeid");
    expect(deposits[0].amounts[0].amount).equals(
      amount,
      "Incorrect tracked the received runes of address",
    );
    expect(deposits[0].amounts[0].senderAddress).equals(
      SENDER_ADDRESS,
      "Incorrect sender of the received runes",
    );
  });
});
