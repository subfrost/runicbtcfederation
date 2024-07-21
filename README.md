# runicbtcfederation

Protorune indexer for RUNIC•BTC•FEDERATION and exchange logic for RUNIC•BTC•NOTE.

This README.md defines structures used by the runtime, which include on-chain governance and dividends.

## Governance

Unique units of RUNIC•BTC•FEDERATION are ordered according to ordinal theory, in the order they are minted and transferred on their runic representation. Protoburns preserve the ranges that are burned.

Vote tokens can only be generated once per unit of RUNIC•BTC•FEDERATION per proposal, and are tracked in terms of the ProposalId.

```proto
message ProposalId {
  uint64 height = 1;
  uint32 txindex = 2;
}
```

Message bytes for a protomessage are serialized from the the structure:

```proto
message FederationMessage {
  oneof data {
    Proposal proposal = 1;
    Vote vote = 2;
    ClaimDividends claim = 3;
  }
}
```

The substructures are defined later in this section.

Anyone with at least 10,000 RUNIC•BTC•FEDERATION can create a proposal. The proposal requires at least 5M RUNIC•BTC•FEDERATION for quorum and quorum is reached automatically at 10M RUNIC•BTC•FEDERATION. The quorum height should be at least 200 blocks in the future. To create the proposal, a protorune RunestoneMessage edict should spend RUNIC•BTC•FEDERATION as well as a text based inscription reveal beginning with the text "Federation Proposal:\n" to a protomessage with calldata of the oneof structure being:

```proto
message Proposal {
  uint64 quorumHeight = 1;
  uint64 quorumThreshold = 2;
  uint64 quorumMinimum = 3;
  repeated string choices = 4;
  uint32 voteIndex = 5;
}
```

To vote on a proposal, spend RUNIC•BTC•FEDERATION to a protomessage of the form:

```proto
message Vote {
  ProposalId proposal = 1;
  uint32 voteIndex = 2;
}
```

The pointer in the protomessage points to the output which will hoold vote protorunes which are created 1:1 for the amount of RUNIC•BTC•FEDERATION spent. The refund_pointer will contain the input RUNIC•BTC•FEDERATION spent to the protomessage.

Vote tokens can be transferred as part of a Runestone where the u128 for what would normally represent the txindex actually will store the two u32 values concatenated { txindex, voteIndex } to a u64 value then packed with leb128 as usual.

Proposals are considered to have reached quorum and execute when the total supply of vote tokens >= quorumThreshold OR the block height reaches quorumHeight while the total supply of vote tokens >= quorumMinimum. The resolution of a proposal is measured in terms of the total supply of the vote token for each possible voteIndex in choices.

Vote tokens can be only be minted with RUNIC•BTC•FEDERATION 1:1 and the same ranges of RUNIC•BTC•FEDERATION cannot be used to mint vote tokens more than once per range on the same proposal. For this we must index rune ranges to ensure that each smallest unit of the rune is indexed. Vote tokens can be output to a delegated entity, and vote tokens can also be exchanged for a different vote by transferring to a protomessage with Vote.

It is possible to withdraw a vote by transferring vote tokens to an unspendable output.

## Dividends

Holders of RUNIC•BTC•FEDERATION can spend them to a protomessage that claims dividends for those ranges of RUNIC•BTC•FEDERATION spent. The same dividends cannot be claimed more than once for the same ranges. Ranges accrue value proportional to the amount of protocol feeds captured by RUNIC•BTC•NOTE throughput.

Protocol fees must be honored by mandates voted in via proposals.

View functions support querying payouts of dividends by block, as well as net transfers in response to the receipt of RUNIC•BTC•NOTE or BTC itself.

## Author

The SUBFROST Federation
