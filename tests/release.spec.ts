import fs from "node:fs";

import * as path from "node:path";
import { expect } from "chai";
//@ts-ignore
import bitcoinjs = require("bitcoinjs-lib");
import {
  buildProgram,
  formatKv,
  TEST_BTC_ADDRESS1,
  TEST_BTC_ADDRESS2,
} from "./utils/general";
import {
  initCompleteBlockWithRuneEtching,
  runesbyaddress,
  transferRune,
} from "./utils/rune-helpers";

describe("metashrew-runes", () => {
  it("should check if duplicate keys are not being set", async () => {
    const program = buildProgram();
    program.setBlock(
      fs.readFileSync(path.join(__dirname, "runes-genesis.hex"), "utf8"),
    );
    program.setBlockHeight(840000);
    program.on("log", console.log);
    await program.run("testOverwrite");
    expect(
      Object.keys(formatKv(program.kv)).filter((d) =>
        d.includes("/etching/byruneid"),
      ).length,
    ).to.be.equal(1);
  });
  it("should not index before 840000", async () => {
    const program = buildProgram();
    program.setBlockHeight(839000);
    const premineAmount = 2100000005000000n;
    const outputs = [
      {
        script: bitcoinjs.payments.p2pkh({
          address: TEST_BTC_ADDRESS1,
          network: bitcoinjs.networks.bitcoin,
        }).output,
        value: 1,
      },
      {
        script: bitcoinjs.payments.p2pkh({
          network: bitcoinjs.networks.bitcoin,
          address: TEST_BTC_ADDRESS2,
        }).output,
        value: 624999999,
      },
    ];
    const block = initCompleteBlockWithRuneEtching(
      outputs,
      1,
      undefined,
      premineAmount,
    );
    program.setBlock(block.toHex());
    await program.run("_start");

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    expect(resultAddress1.balanceSheet.length).equals(0);

    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    expect(resultAddress2.balanceSheet.length).equals(0);
  });
  it("index Runestone on etching and premine", async () => {
    const program = buildProgram();
    program.setBlockHeight(840001);
    const premineAmount = 2100000005000000n;
    const outputs = [
      {
        script: bitcoinjs.payments.p2pkh({
          address: TEST_BTC_ADDRESS1,
          network: bitcoinjs.networks.bitcoin,
        }).output,
        value: 1,
      },
      {
        script: bitcoinjs.payments.p2pkh({
          network: bitcoinjs.networks.bitcoin,
          address: TEST_BTC_ADDRESS2,
        }).output,
        value: 624999999,
      },
    ];
    const block = initCompleteBlockWithRuneEtching(
      outputs,
      1,
      undefined,
      premineAmount,
    );
    program.setBlock(block.toHex());
    await program.run("_start");

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    expect(resultAddress1.balanceSheet[0].balance).equals(
      premineAmount,
      "address 1 should be mined premine amount",
    );

    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    expect(resultAddress2.balanceSheet.length).equals(
      0,
      "address 2 should not have anything",
    );
  });
  it("index Runestone on transfer and refund", async () => {
    const program = buildProgram();
    program.setBlockHeight(840000);
    const premineAmount = 2100000005000000n;
    const outputs = [
      {
        script: bitcoinjs.payments.p2pkh({
          address: TEST_BTC_ADDRESS1,
          network: bitcoinjs.networks.bitcoin,
        }).output,
        value: 1,
      },
      {
        script: bitcoinjs.payments.p2pkh({
          network: bitcoinjs.networks.bitcoin,
          address: TEST_BTC_ADDRESS2,
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
      inputTxIndex: 1, // 0 is coinbase, 1 is the mint
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    };
    const runeId = {
      block: 840000n,
      tx: 1,
    };
    const amount = premineAmount / 2n;
    const outputIndexToReceiveRunes = 1; // 0 is the script
    const output = {
      address: TEST_BTC_ADDRESS2,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    };
    // technically this is not a valid transaction since btc in and less than btc out but this is just to test the runes
    const refundOutput = {
      address: TEST_BTC_ADDRESS1,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    };
    const outputRunePointer = 2; // refund points to the refundOutput

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

    const remainingAmount = premineAmount - amount;

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    console.log(resultAddress1.balanceSheet);
    expect(resultAddress1.balanceSheet[0].balance).equals(
      remainingAmount,
      "amount refund to address 1 is incorrect",
    );
    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    console.log(resultAddress2.balanceSheet);
    expect(resultAddress2.balanceSheet[0].balance).equals(
      amount,
      "amount to address 2 is incorrect",
    );
  });
  it("index Runestone on transfer and refund to self", async () => {
    const program = buildProgram();
    program.setBlockHeight(840000);
    const premineAmount = 2100000005000000n;
    const outputs = [
      {
        script: bitcoinjs.payments.p2pkh({
          address: TEST_BTC_ADDRESS1,
          network: bitcoinjs.networks.bitcoin,
        }).output,
        value: 1,
      },
      {
        script: bitcoinjs.payments.p2pkh({
          network: bitcoinjs.networks.bitcoin,
          address: TEST_BTC_ADDRESS2,
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
      inputTxIndex: 1, // 0 is coinbase, 1 is the mint
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    };
    const runeId = {
      block: 840000n,
      tx: 1,
    };
    const amount = premineAmount / 2n;
    const outputIndexToReceiveRunes = 1; // 0 is the script
    const output = {
      address: TEST_BTC_ADDRESS2,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    };
    const refundOutput = {
      address: TEST_BTC_ADDRESS1,
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

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    console.log(resultAddress1.balanceSheet);
    expect(resultAddress1.balanceSheet.length).equals(
      0,
      "address 1 should not have any runes left",
    );
    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    console.log(resultAddress2.balanceSheet);
    expect(resultAddress2.balanceSheet[0].balance).equals(
      premineAmount,
      "amount to address 2 should be entire premineAmount",
    );
  });
  it("index Runestone on burn", async () => {
    const program = buildProgram();
    program.setBlockHeight(840000);
    const premineAmount = 2100000005000000n;
    const outputs = [
      {
        script: bitcoinjs.payments.p2pkh({
          address: TEST_BTC_ADDRESS1,
          network: bitcoinjs.networks.bitcoin,
        }).output,
        value: 1,
      },
      {
        script: bitcoinjs.payments.p2pkh({
          network: bitcoinjs.networks.bitcoin,
          address: TEST_BTC_ADDRESS2,
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
      inputTxIndex: 1, // 0 is coinbase, 1 is the mint
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    };
    const runeId = {
      block: 840000n,
      tx: 1,
    };
    const amount = premineAmount;
    const outputIndexToReceiveRunes = 0; // 0 is the script
    const output = {
      address: TEST_BTC_ADDRESS2,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    };
    const outputRunePointer = 0; // leftover amount should go to output 0, the script, which means it will be burned

    block = transferRune(
      [input],
      runeId,
      amount,
      outputIndexToReceiveRunes,
      [output],
      outputRunePointer,
      block,
    );

    program.setBlock(block.toHex());

    await program.run("_start");

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    console.log(resultAddress1.balanceSheet);
    expect(resultAddress1.balanceSheet.length).equals(
      0,
      "address 1 should not have any runes left",
    );
    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    console.log(resultAddress2.balanceSheet);
    expect(resultAddress2.balanceSheet.length).equals(
      0,
      "address 2 should not have any runes left",
    );
  });
});
