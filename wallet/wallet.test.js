const Wallet=require('./wallet');

describe('wallet',()=>{
    let wallet;
    beforeEach(()=>{
        wallet=new Wallet();
    });
    it('has a `balance`',()=>{
        expect(wallet).toHaveProperty('balance');
    });

    it('has `publicKey`',()=>{
        expect(wallet).toHaveProperty('publicKey');
    });
})