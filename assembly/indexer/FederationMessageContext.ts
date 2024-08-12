import { decodeHex } from "metashrew-as/assembly";
import { PROPOSALS } from "quorumgenesisprotorune/assembly/tables";
import {
  FEDERATION_HEIGHT,
  FEDERATION_TXINDEX,
  SYNTHETIC_HEIGHT,
  SYNTHETIC_TXINDEX
} from "../constants";
import { Inscription } from "metashrew-as/assembly/blockdata/inscription";
import {
  Transaction,
  Input,
  Output,
  OutPoint,
} from "metashrew-as/assembly/blockdata/transaction";
import { findInscription, QuorumMessageContext } from "quorumgenesisprotorune/assembly/indexer/QuorumMessageContext";
import { IncomingRune } from "protorune/assembly/indexer/protomessage/IncomingRune";
import { RunestoneMessage } from "metashrew-runes/assembly/indexer/RunestoneMessage";
import { FederationField } from "./fields/FederationField";
import { Proposal } from "quorumgenesisprotorune/assembly/indexer/Proposal";
import { Box } from "metashrew-as/assembly/utils/box";
import { u128 } from "as-bignum/assembly";
import { console } from "metashrew-as/assembly/utils";

function isFederationProtorune(rune: IncomingRune): boolean {
  if (
    rune.runeId.block === u128.from(FEDERATION_HEIGHT) &&
    rune.runeId.tx === u128.from(FEDERATION_TXINDEX)
  )
    return true;
  return false;
}

function findIncomingFederationProtorunes(
  runes: Array<IncomingRune>,
): IncomingRune {
  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];
    if (isFederationProtorune(rune)) return rune;
  }
  return changetype<IncomingRune>(0);
}
export class FederationMessageContext extends QuorumMessageContext {
  static PROPOSAL_PREFIX: ArrayBuffer = decodeHex(
    "46454445524154494f4e2050726f706f73616c3a0a"
  );
  protocolTag(): u128 {
    const tag = u128.from("88");
    return tag;
  }
  proposal(): ArrayBuffer {
    const inscription = findInscription(this.transaction.ins);
    if (changetype<usize>(inscription) === 0) return changetype<ArrayBuffer>(0);
    const body = inscription.body();
    if (changetype<usize>(body) === 0) return changetype<ArrayBuffer>(0);
    if (
      body != null &&
      memory.compare(
        changetype<usize>(body),
        changetype<usize>(QuorumMessageContext.PROPOSAL_PREFIX),
        <usize>FederationMessageContext.PROPOSAL_PREFIX.byteLength,
      ) === 0
    )
      return Box.from(body)
        .shrinkFront(FederationMessageContext.PROPOSAL_PREFIX.byteLength)
        .toArrayBuffer();
    return changetype<ArrayBuffer>(0);
  }
  proposalMinimum(): u128 {
    return u128.from(10000);
  }
  handle(): boolean {
    const action = RunestoneMessage.parse(this.calldata);
    if (action.fields.has(FederationField.PROPOSAL)) {
      const incomingGenesis: IncomingRune = findIncomingFederationProtorunes(
        this.runes,
      );
      if (changetype<usize>(incomingGenesis) === 0) return false;
      if (incomingGenesis.amount < this.proposalMinimum()) return false;
      const proposal = this.proposal();
      if (changetype<usize>(proposal) === 0) return false;
      const payload = action.fields.get(FederationField.PROPOSAL);
      if (payload.length !== 2) return false;
      Proposal.from(this.height, this.txindex, payload, proposal).save(
        PROPOSALS,
      );
    } else if (action.fields.has(FederationField.VOTE)) {
      /* TODO: implement votes */
    }
    return true;
  }
}
