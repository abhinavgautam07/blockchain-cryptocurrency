const STARTING_BALANCE = require('../config/config').STARTING_BALANCE;
const {ec} = require('../utilities/elliptic');
const cryptoHash = require('../utilities/crypto-hash');
const Transaction = require('./transactions');

/*the thing about asymmetric cryptography is that..if encrypted using private key can be decrypted with public key only
and if encrypted using using public can be decrypted with private key only


a peer's public key is known to every other peer,but private key is available to peer  only

so a message is encrypted using reciver's public key so that only receiver can decrypt it with his private key

--------authentication--------
but along with secrecy we need authentication that is the person who has sent the message is known and verified
so for this sender has to sign the encrypted message with his private key...so that reciver can verify it using sender's public key(as public key is available with everyone).

address of a wallet is its public key
using this address other peers can send currency to the peer whose wallet is this..
*/
class Wallet {

    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');

    }
    sign(data) {
        //signature done using privatekey  and the keypair has sign function
        
        //also sign method works optimally on the hashed data
        return this.keyPair.sign(cryptoHash(data));
    }

    createtransaction({ recipient, amount, chain }) {

        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }
        if (amount > this.balance) {

            throw new Error('Not enough funds');

        } else {

            return new Transaction({ senderWallet: this, recipient, amount });
        }


    }
    static calculateBalance({ chain, address }) {
        let outputTotal = 0;
        let hasMadeTransaction=false;
        for (let i =chain.length; i >0; i--) {

            const block = chain[i];
            for (const transaction of block.data) {
                if(transaction.input.address===address){
                    hasMadeTransaction=true;
                }
                let outputAddress = transaction.outputMap[address];

                if (outputAddress) {
                    outputTotal += outputAddress;
                }

            }
            if(hasMadeTransaction){
                break;
            }
        }

        return hasMadeTransaction? outputTotal: STARTING_BALANCE + outputTotal;
    }
}

module.exports = Wallet;



/*--------Notes----------------*/
//1. A valid digital signature, where the prerequisites are satisfied, gives a recipient very strong reason to believe that the message was created by a known sender (authentication), and that the message was not altered in transit (integrity).

// 2.when a sender sends a message he will obtain a signature or sign(sign function does that) the
// message using its `privateKey and the data`
// then the person receiving the message will verify the signature using the incoming message and the sender's public key to ensure that message is incoming from the known user.

//for verification of signature what is done that the data from the signature is obtained and matched with the incoming data.



