# runicbtcfederation

Repository for the core FederationIndex class, built for the metashrew indexer runtime. Indexer sources are aggregated here to encompass the full scope of L0 support covered by the canonical SUBFROST signing group.

The FederationIndex class bundles supported indexers to perform operations related to RUNIC•BTC•FEDERATION and any associated exchange logic for RUNIC•BTC•NOTE, on any subprotocol honored by SUBFROST.

This README.md defines structures used by the runtime, which include on-chain governance and dividends.

## Purpose

The SUBFROST software is effectively a taproot multisig coordinated by metashrew, and thus has the full programmability of WASM itself. The indexer actively processes new blocks as they are mined, and hosts the view functions needed by SUBFROST to compute a list of payments of both notes and Bitcoi native currency, representing the output of a trade against SUBFROST (i.e. the redemption of notes for BTC currency and vice versa). A trade against SUBFROST is performed simply by sending either BTC currency or the notes honored by the system, on either runes, protorunes, or any metaprotocol whose indexer is included in the runtime build here.

The FederationIndex ultimately aggregates one of the most expressive metaprotocols in existence as of this writing. In addition to running indexer logic for a number of sibling subprotocols, the FederationIndex itself indexes operations on units of the FEDERATION governance note, inheriting a modified version of the governance logic within the genesis protorune governance framework. This logic can be referenced here: [https://github.com/kungfuflex/quorumgenesisprotorune](https://github.com/kungfuflex/quorumgenesisprotorune).

In addition, FEDERATION governance assets can be used to claim dividends in a manner available and unique to the Bitcoin indexer model, which makes use of the inherited genesis protorune system of asset numbering. That is, by applying ordinal theory to runes, the indexer is able to track not only the uniqueness of governance assets for the votes they are used to cast, but also the uniqueness of assets for the amounts of dividends available to unique ranges of the asset.

In this way, you can only claim emissions once, per unit of the asset, as new emissions are produced with each block.

## Governance

Protocol structures for federation governance inherit their behavior from QUORUM•GENESIS•PROTORUNE (codebase hosted at [https://github.com/kungfuflex/quorumgenesisprotorune](https://github.com/kungfuflex/quorumgenesisprotorune)).

Vote tokens can only be generated once per unit of RUNIC•BTC•FEDERATION per proposal, and are tracked in terms of the ProposalId.

Anyone with at least 10,000 RUNIC•BTC•FEDERATION can create a proposal. The proposal requires at least 5M RUNIC•BTC•FEDERATION for quorum and quorum is reached automatically at 10M RUNIC•BTC•FEDERATION. The quorum height should be at least 200 blocks in the future. To create the proposal, a protorune RunestoneMessage edict should spend RUNIC•BTC•FEDERATION as well as a text based inscription reveal beginning with the text "Federation Proposal:\n" with the standard governance leb128[] structure as the genesis protorune.

## Dividends

Holders of RUNIC•BTC•FEDERATION can spend them to a protomessage that claims dividends for those ranges of RUNIC•BTC•FEDERATION spent. The same dividends cannot be claimed more than once for the same ranges. Ranges accrue value proportional to the amount of protocol feeds captured by RUNIC•BTC•NOTE throughput.

Protocol fees must be honored by mandates voted in via proposals.

View functions support querying payouts of dividends by block, as well as net transfers in response to the receipt of RUNIC•BTC•NOTE or BTC itself.

## Protocol Messages

```js
class QuorumField {
  static PROPOSAL: u64 = 95;
  static VOTE: u64 = 97
}
class FederationField extends QuorumField {
  static CLAIM: u64 = 99
}
```

## Author

The SUBFROST Federation
