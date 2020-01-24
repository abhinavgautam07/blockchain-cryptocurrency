const GENESIS_DATA = require('../config/config').GENESIS_DATA;
const MINE_RATE=require('../config/config').MINE_RATE;
const hextoBinary=require('hex-to-binary');
const cryptoHash = require('../utilities/crypto-hash');
class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        // console.log(timestamp,lastHash,hash,nonce,difficulty);
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }
    static genesis() {
        // console.log("genesis",GENESIS_DATA);
        return new Block(GENESIS_DATA);
        //or return new this(GENESIS_DATA);
        //inside static functions this refers to the class itself

    }
    // finding a nonce that unlocks a hash that meets the difficulty requirement is that very proof
    //nonce originates from number used once
    static mineBlock({ lastBlock, data }) {
        let hash, timestamp;
        
        // const timestamp=Date.now();
        const lastHash = lastBlock.hash;
        let difficulty = lastBlock.difficulty;
        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty=Block.adjustDifficulty(lastBlock,timestamp);
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hextoBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new Block({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
        });

    }
    static adjustDifficulty(lastBlock,timestamp){
        //timestamp is timestamp of the current block which is getting mined
        const difficulty=lastBlock.difficulty;
        const difference=timestamp-lastBlock.timestamp;
        if(difficulty<1)return 1;
        if(difference>MINE_RATE){
            return difficulty-1;
        }
        return difficulty+1;
    }
}

module.exports = Block;