const Block = require('./block');
const GENESIS_DATA = require('../config/config').GENESIS_DATA;
const cryptoHash=require('../utilities/crypto-hash');
describe('Block', () => {
    const timestamp = 'a-date';
    const lastHash = 'foo-hash';
    const hash = 'a-hash';
    const data = 'foo-data';
    const block = new Block({ timestamp, lastHash, hash, data });


    it('has timestamp,hash,lastHash,data', () => {

        expect(block.timestamp).toEqual(timestamp);

    });
});

describe('genesis()', () => {
    const genesisBlock = Block.genesis();
    it('returns a Block instance', () => {
        expect(genesisBlock instanceof Block).toBe(true);

    });
    it('returns the genesis data', () => {

        //js implemets classes as objects so the instanceof Block with genesis data is the GENESIS_DATA object itself
        expect(genesisBlock).toEqual(GENESIS_DATA);
    })
});
describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'foo-data';
    const minedBlock = Block.mineBlock({ lastBlock, data });
    it('creates a SHA-256 hash based on inputs', () => {
        expect(minedBlock.hash)
            .toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data));
    });
});