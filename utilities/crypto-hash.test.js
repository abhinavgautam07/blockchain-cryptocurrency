const cryptoHash=require('./crypto-hash');

describe('cryptohash()',()=>{
    it('has same output of different order of input',()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));

    });
});