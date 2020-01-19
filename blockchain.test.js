const Blockchain = require('./blockchain');
const Block = require('./block');

describe('blockchain', () => {
    let blockchain;
    beforeEach(() => {
        blockchain = new Blockchain();
    })

    it('contains `chain` as Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });
    it('adds new block to the chain', () => {
        const newData = 'foo';
        blockchain.addBlock({ data: newData });
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });
    describe('isValid', () => {
        describe('when the chain does not start with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'false-genesis' };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });
        describe('when chain starts with genesis block and has mutiple blocks', () => {
            beforeEach(()=>{
                blockchain.addBlock({ data: 'Bears' });
                blockchain.addBlock({ data: 'Beets' });
                blockchain.addBlock({ data: 'BattleStar Galactica' });
            });
            describe('and lastHash refernce has changed', () => {
                it('returns false', () => {
                   
                    blockchain.chain[2].lastHash = 'broken-hash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and chain contains a block with invalid field', () => {
                it('returns false', () => {
                    
                    blockchain.chain[2].data = 'bad-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and chain does not contain any invalid block', () => {
                it('returns true', () => {
              
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);

                });
            });

        });

    });
});


