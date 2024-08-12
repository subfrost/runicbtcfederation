# runicbtcfederation

Protorune indexer for RUNIC•BTC•FEDERATION and exchange logic for RUNIC•BTC•NOTE.

This README.md defines structures used by the runtime, which include on-chain governance and dividends.

## Governance

Unique units of RUNIC•BTC•FEDERATION are ordered according to ordinal theory, in the order they are minted and transferred on their runic representation. Protoburns preserve the ranges that are burned.

Protocol structures for federation governance inherit their behavior from QUORUM•GENESIS•PROTORUNE (codebase hosted at [https://github.com/kungfuflex/quorumgenesisprotorune](https://github.com/kungfuflex/quorumgenesisprotorune)).

Vote tokens can only be generated once per unit of RUNIC•BTC•FEDERATION per proposal, and are tracked in terms of the ProposalId.

Anyone with at least 10,000 RUNIC•BTC•FEDERATION can create a proposal. The proposal requires at least 5M RUNIC•BTC•FEDERATION for quorum and quorum is reached automatically at 10M RUNIC•BTC•FEDERATION. The quorum height should be at least 200 blocks in the future. To create the proposal, a protorune RunestoneMessage edict should spend RUNIC•BTC•FEDERATION as well as a text based inscription reveal beginning with the text "Federation Proposal:\n" with the standard governance leb128[] structure as the genesis protorune.

## Dividends

Holders of RUNIC•BTC•FEDERATION can spend them to a protomessage that claims dividends for those ranges of RUNIC•BTC•FEDERATION spent. The same dividends cannot be claimed more than once for the same ranges. Ranges accrue value proportional to the amount of protocol feeds captured by RUNIC•BTC•NOTE throughput.

Protocol fees must be honored by mandates voted in via proposals.

View functions support querying payouts of dividends by block, as well as net transfers in response to the receipt of RUNIC•BTC•NOTE or BTC itself.

## Author

The SUBFROST Federation
