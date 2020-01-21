const Block = require('./block');
console.log('file calling');
const cryptoHash = require('./crypto-hash');
class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }
    addBlock(data) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data: data
        });

        this.chain.push(newBlock);

    }
    static isValidChain(chain) {

        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }
        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];

            const actualHash = chain[i - 1].hash;

            const lastDifficulty = chain[i - 1].difficulty;

            if (Math.abs(difficulty - lastDifficulty) > 1) return false;

            if (lastHash !== actualHash) {

                return false;
            }

            const validHash = cryptoHash(timestamp, data, lastHash);
            if (validHash !== hash) return false;


        }

        return true;
    }
    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) return;

        if (!Blockchain.isValidChain(newChain)) return;

        this.chain = newChain;
        return;
    }
}
module.exports = Blockchain;