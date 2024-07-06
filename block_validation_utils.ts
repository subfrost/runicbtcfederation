import * as bitcoin from 'bitcoinjs-lib';
import * as crypto from 'crypto';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

// Example function to validate a block
function validateBlock(blockHex: string, network: bitcoin.Network = bitcoin.networks.bitcoin): boolean {
    try {
        // Parse the block
        const block = bitcoin.Block.fromHex(blockHex);

        // Validate the block's proof of work
        const target = bitcoin.Block.calculateTarget(block.bits);
        const hash = block.getHash();

        if (hash.compare(target) > 0) {
            console.error('Invalid proof of work');
            return false;
        }

        if (block.transactions) {
            // Validate each transaction in the block
            for (const txHex of block.transactions.map(tx => tx.toHex())) {
                const tx = bitcoin.Transaction.fromHex(txHex);

                // Add your transaction validation logic here
                // For example, checking if the transaction inputs and outputs are correct
                if (!validateTransaction(tx, network)) {
                    console.error('Invalid transaction');
                    return false;
                }
            }
        }

        // Additional block validation checks can be added here
        // For example, checking the block size, timestamp, etc.

        console.log('Block is valid');
        return true;
    } catch (error) {
        console.error('Block validation failed', error);
        return false;
    }
}

/// Example function to validate a transaction
async function validateTransaction(tx: bitcoin.Transaction, network: bitcoin.Network): Promise<boolean> {
    try {
        // Validate transaction structure
        if (!tx || !tx.ins || !tx.outs) {
            console.error('Invalid transaction structure');
            return false;
        }

        // Fetch UTXO details for inputs (you would replace this with actual UTXO lookup)
        for (const input of tx.ins) {
            const utxo = await fetchUtxo(input.hash, input.index, network);
            if (!utxo) {
                console.error('Referenced UTXO not found');
                return false;
            }

            // Validate signature
            const prevOutScript = utxo.scriptPubKey;
            const pubkey = getPubKeyFromScript(input);
            if (!pubkey) {
                console.error('Public key not found in input script');
                return false;
            }

            const sighash = tx.hashForSignature(input.index, prevOutScript, bitcoin.Transaction.SIGHASH_ALL);
            const signature = bitcoin.script.signature.decode(input.script).signature;
            if (!ecc.verify(sighash, pubkey, signature)) {
                console.error('Invalid signature');
                return false;
            }
        }

        // Additional validation logic can go here, such as checking outputs

        console.log('Transaction is valid');
        return true;
    } catch (error) {
        console.error('Transaction validation failed', error);
        return false;
    }
}

// Fetch UTXO (Unspent Transaction Output) details
async function fetchUtxo(txid: Buffer, index: number, network: bitcoin.Network): Promise<any> {
    const txidHex = txid.reverse().toString('hex'); // Reverse byte order for display
    const url = `https://api.blockcypher.com/v1/btc/${network === bitcoin.networks.testnet ? 'test3' : 'main'}/txs/${txidHex}`;

    try {
        const response = await axios.get(url);
        const utxo = response.data.outputs[index];
        return {
            scriptPubKey: Buffer.from(utxo.script, 'hex'),
            value: utxo.value,
        };
    } catch (error) {
        console.error('Failed to fetch UTXO details', error);
        return null;
    }
}

// Extract public key from input script
function getPubKeyFromScript(input: bitcoin.TxInput): Buffer | null {
    // This example assumes P2PKH; handle other script types as needed
    try {
        const chunks = bitcoin.script.decompile(input.script);
        if (!chunks || chunks.length !== 2) return null;
        const pubkey = chunks[1] as Buffer;
        return pubkey;
    } catch {
        return null;
    }
}

// Example block in hex format
const blockHex = '...'; // Replace with an actual block hex

// Validate the block
validateBlock(blockHex);
