import fs from "node:fs";

import { inspect } from "node:util";
import { IndexerProgram, readArrayBufferAsHex } from "metashrew-test";
import * as path from "node:path";
import { expect } from "chai";
//@ts-ignore
import bitcoinjs = require("bitcoinjs-lib");
import * as ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { encodeRunestone } from "@magiceden-oss/runestone-lib";
import { MetashrewRunes } from "../lib/rpc";
import { error } from "node:console";

const EMPTY_BUFFER = Buffer.allocUnsafe(0);
const EMPTY_WITNESS = [];

const TEST_BTC_ADDRESS1 = "16aE44Au1UQ5XqKMUhCMXTX7ZxbmAcQNA1";
const TEST_BTC_ADDRESS2 = "1AdAhGdUgGF6ip7bBcVvuWYuuCxAeonNaK";

const DEBUG_WASM = fs.readFileSync(
  path.join(__dirname, "..", "build", "debug.wasm"),
);

const log = (obj: any) => {
  console.log(inspect(obj, false, 10, true));
};

const stripHexPrefix = (key: string) => {
  if (key.substr(0, 2) === "0x") return key.substr(2);
  return key;
};

const addHexPrefix = (s: string) => {
  if (s.substr(0, 2) === "0x") return s;
  return "0x" + s;
};

const split = (ary, sym) => {
  return ary.reduce((r, v) => {
    if (v === sym) {
      r.push([]);
    } else {
      if (r.length === 0) r.push([]);
      r[r.length - 1].push(v);
    }
    return r;
  }, []);
};

const formatKey = (key: string) => {
  return split(
    Array.from(Buffer.from(stripHexPrefix(key), "hex")),
    Buffer.from("/")[0],
  ).reduce((r, v, i, ary) => {
    const token = Buffer.from(v).toString("utf8");
    if (!(i + v.length)) {
      return r + "/";
    } else if (token.match(/^[0-9a-zA-Z]+$/)) {
      return r + "/" + token;
    } else {
      return r + "/" + addHexPrefix(Buffer.from(v).toString("hex"));
    }
  }, "");
};

const formatValue = (v) => {
  const token = Buffer.from(v.substr(2), "hex").toString("utf8");
  if (token.match(/^[0-9a-zA-Z]+$/)) return token;
  return v;
};

const formatKv = (kv: any) => {
  return Object.fromEntries(
    Object.entries(kv).map(([key, value]) => [formatKey(key), value]),
  );
};

const buildProgram = () => {
  const program = new IndexerProgram(
    new Uint8Array(Array.from(DEBUG_WASM)).buffer,
  );
  program.on("log", (v) => console.log(v.replace(/\0/g, "").trim()));
  return program;
};

const buildBytes32 = () => Buffer.allocUnsafe(32);

const buildCoinbase = (outputs) => {
  const tx = new bitcoinjs.Transaction();
  tx.ins.push({
    hash: buildBytes32(),
    index: bitcoinjs.Transaction.DEFAULT_SEQUENCE,
    script: EMPTY_BUFFER,
    sequence: bitcoinjs.Transaction.DEFAULT_SEQUENCE,
    witness: EMPTY_WITNESS,
  });
  outputs.forEach((v) => tx.outs.push(v));
  return tx;
};

const buildInput = (o) => {
  return {
    ...o,
    script: EMPTY_BUFFER,
    sequence: bitcoinjs.Transaction.DEFAULT_SEQUENCE,
    witness: EMPTY_WITNESS,
  };
};

const buildTransaction = (ins, outs) => {
  const tx = new bitcoinjs.Transaction();
  ins.forEach((v) => tx.ins.push(v));
  outs.forEach((v) => tx.outs.push(v));
  return tx;
};

const buildCoinbaseToAddress = (address: string) =>
  buildCoinbase([
    {
      script: bitcoinjs.payments.p2pkh({
        address: address,
        network: bitcoinjs.networks.bitcoin,
      }).output,
      value: 625000000,
    },
  ]);

const buildDefaultBlock = () => {
  const block = new bitcoinjs.Block();
  block.prevHash = buildBytes32();
  block.merkleRoot = buildBytes32();
  block.witnessCommit = buildBytes32();
  block.transactions = [];
  return block;
};

const runTest = (s) =>
  it(s, async () => {
    const program = buildProgram();
    await program.run(s);
    await new Promise((r) => setTimeout(r, 2000));
    return program;
  });

const runesbyaddress = async (
  program: IndexerProgram,
  address: string,
): any => {
  const cloned = program; // just mutate it
  const result = await MetashrewRunes.prototype.runesbyaddress.call(
    {
      async _call({ input }) {
        cloned.setBlock(input);
        const ptr = await cloned.run("runesbyaddress");
        return readArrayBufferAsHex(cloned.memory, ptr);
      },
    },
    { address },
  );
  return result;
};

const initCompleteBlockWithRuneEtching = (
  outputs: any,
  pointer: number,
  divisibility: number = 8,
  premineAmount: bigint = 2100000005000000n,
  runeName: string = "GENESIS•RUNE•FR",
  symbol: string = "G",
  block?: bitcoinjs.Block
): bitcoinjs.Block => {
  let coinbase;
  if (block == undefined) {
    block = buildDefaultBlock()
    coinbase = buildCoinbaseToAddress(TEST_BTC_ADDRESS1);
    block.transactions?.push(coinbase);
  } else {
    coinbase = block.transactions?.at(0)
  }
  const runesGenesis = encodeRunestone({
    etching: {
      divisibility: divisibility,
      premine: premineAmount,
      runeName: runeName,
      symbol: symbol,
    },
    pointer: pointer,
  }).encodedRunestone;
  const transaction = buildTransaction(
    [
      {
        hash: coinbase.getHash(),
        index: 0,
        witness: EMPTY_WITNESS,
        script: EMPTY_BUFFER,
      },
    ],
    [
      {
        script: runesGenesis,
        value: 0,
      },
      ...outputs
    ],
  );
  block.transactions?.push(transaction);
  return block;
}

const transferRune = (
  inputs: {
    inputTxIndex: number,
    inputTxOutputIndex: number,
  }[],
  runeId: {
    block: bigint;
    tx: number;
  },
  runeTransferAmount: bigint,
  outputIndexToReceiveRunes: number,
  outputs: {
    address: string;
    btcAmount: number;
  }[],
  outputRunePointer: number = 1, // default output for leftover runes
  block?: bitcoinjs.Block
): bitcoinjs.Block => {
  if (block == undefined) {
    block = buildDefaultBlock()
    const coinbase = buildCoinbaseToAddress(TEST_BTC_ADDRESS1);
    block.transactions?.push(coinbase);
  }


  const blockInputs = inputs.map(input => {
    const inputRuneTx = block?.transactions?.at(input.inputTxIndex)
    return {
      hash: inputRuneTx?.getHash(),
      index: input.inputTxOutputIndex,
      witness: EMPTY_WITNESS,
      script: EMPTY_BUFFER,
    }
  })
  const blockOutputs = outputs.map(output => {
    return {
      script: bitcoinjs.payments.p2pkh({
        address: output.address,
        network: bitcoinjs.networks.bitcoin,
      }).output,
      value: output.btcAmount,
    }
  })
  const edicts = [
    {
      id: runeId,
      amount: runeTransferAmount,
      output: outputIndexToReceiveRunes
    }
  ]
  const runesTransfer = encodeRunestone({
    edicts: edicts,
    pointer: outputRunePointer,
  }).encodedRunestone;
  const transaction = buildTransaction(
    [
      ...blockInputs,
    ],
    [
      {
        script: runesTransfer,
        value: 0,
      },
      ...blockOutputs
    ],
  );
  block.transactions?.push(transaction);
  return block;
}

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
    const premineAmount = 2100000005000000n
    const outputs = [{
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
    }]
    const block = initCompleteBlockWithRuneEtching(outputs, 1, undefined, premineAmount)
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
    const premineAmount = 2100000005000000n
    const outputs = [{
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
    }]
    const block = initCompleteBlockWithRuneEtching(outputs, 1, undefined, premineAmount)
    program.setBlock(block.toHex());
    await program.run("_start");

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    expect(resultAddress1.balanceSheet[0].balance).equals(premineAmount, "address 1 should be mined premine amount");

    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    expect(resultAddress2.balanceSheet.length).equals(0, "address 2 should not have anything");
  });
  it("index Runestone on transfer and refund", async () => {
    const program = buildProgram();
    program.setBlockHeight(840000);
    const premineAmount = 2100000005000000n
    const outputs = [{
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
    }]
    const pointer1 = 1
    let block = initCompleteBlockWithRuneEtching(outputs, pointer1, undefined, premineAmount)


    const input = {
      inputTxIndex: 1, // 0 is coinbase, 1 is the mint 
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    }
    const runeId = {
      block: 840000n,
      tx: 1
    }
    const amount = premineAmount / 2n
    const outputIndexToReceiveRunes = 1 // 0 is the script
    const output = {
      address: TEST_BTC_ADDRESS2,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    }
    // technically this is not a valid transaction since btc in and less than btc out but this is just to test the runes
    const refundOutput = {
      address: TEST_BTC_ADDRESS1,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    }
    const outputRunePointer = 2 // refund points to the refundOutput

    block = transferRune([input], runeId, amount, outputIndexToReceiveRunes, [output, refundOutput], outputRunePointer, block)

    program.setBlock(block.toHex());

    await program.run("_start");

    const remainingAmount = premineAmount - amount

    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    console.log(resultAddress1.balanceSheet)
    expect(resultAddress1.balanceSheet[0].balance).equals(remainingAmount, "amount refund to address 1 is incorrect");
    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    console.log(resultAddress2.balanceSheet)
    expect(resultAddress2.balanceSheet[0].balance).equals(amount, "amount to address 2 is incorrect");
  });
  it("index Runestone on transfer and refund to self", async () => {
    const program = buildProgram();
    program.setBlockHeight(840000);
    const premineAmount = 2100000005000000n
    const outputs = [{
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
    }]
    const pointer1 = 1
    let block = initCompleteBlockWithRuneEtching(outputs, pointer1, undefined, premineAmount)


    const input = {
      inputTxIndex: 1, // 0 is coinbase, 1 is the mint 
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    }
    const runeId = {
      block: 840000n,
      tx: 1
    }
    const amount = premineAmount / 2n
    const outputIndexToReceiveRunes = 1 // 0 is the script
    const output = {
      address: TEST_BTC_ADDRESS2,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    }
    const refundOutput = {
      address: TEST_BTC_ADDRESS1,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    }
    const outputRunePointer = 1 // leftover amount should go to output 1, so output 1 should have ALL premine runes

    block = transferRune([input], runeId, amount, outputIndexToReceiveRunes, [output, refundOutput], outputRunePointer, block)

    program.setBlock(block.toHex());

    await program.run("_start");


    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    console.log(resultAddress1.balanceSheet)
    expect(resultAddress1.balanceSheet.length).equals(0, "address 1 should not have any runes left");
    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    console.log(resultAddress2.balanceSheet)
    expect(resultAddress2.balanceSheet[0].balance).equals(premineAmount, "amount to address 2 should be entire premineAmount");
  });
  it("index Runestone on burn", async () => {
    const program = buildProgram();
    program.setBlockHeight(840000);
    const premineAmount = 2100000005000000n
    const outputs = [{
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
    }]
    const pointer1 = 1
    let block = initCompleteBlockWithRuneEtching(outputs, pointer1, undefined, premineAmount)


    const input = {
      inputTxIndex: 1, // 0 is coinbase, 1 is the mint 
      inputTxOutputIndex: pointer1, // index of output in the input tx that has the runes. In this case it is the default pointer of the mint
    }
    const runeId = {
      block: 840000n,
      tx: 1
    }
    const amount = premineAmount
    const outputIndexToReceiveRunes = 0 // 0 is the script
    const output = {
      address: TEST_BTC_ADDRESS2,
      btcAmount: 1, //this can be implied to be 1 since runes usually are just inscribed on a satoshi
    }
    const outputRunePointer = 0 // leftover amount should go to output 0, the script, which means it will be burned

    block = transferRune([input], runeId, amount, outputIndexToReceiveRunes, [output], outputRunePointer, block)

    program.setBlock(block.toHex());

    await program.run("_start");


    const resultAddress1 = await runesbyaddress(program, TEST_BTC_ADDRESS1);
    console.log(resultAddress1.balanceSheet)
    expect(resultAddress1.balanceSheet.length).equals(0, "address 1 should not have any runes left");
    const resultAddress2 = await runesbyaddress(program, TEST_BTC_ADDRESS2);
    console.log(resultAddress2.balanceSheet)
    expect(resultAddress2.balanceSheet.length).equals(0, "address 2 should not have any runes left");
  });
});