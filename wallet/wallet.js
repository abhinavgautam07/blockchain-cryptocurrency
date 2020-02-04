const STARTING_BALANCE = require('../config/config').STARTING_BALANCE;
const ec = require('../utilities/elliptic').ec;
const cryptoHash = require('../utilities/crypto-hash');
const Transaction = require('./transactions');
// whatever is encrypted with a public key may only be decrypted by its corresponding private key and vice versa.
// For example, if Bob wants to send sensitive data to Alice, and wants to be sure that only Alice may be able to read it, he will encrypt the data with Alice's Public Key. Only Alice has access to her corresponding Private Key and as a result is the only person with the capability of decrypting the encrypted data back into its original form.
// For example, if Bob wants to send sensitive data to Alice, and wants to be sure that only Alice may be able to read it, he will encrypt the data with Alice's Public Key. Only Alice has access to her corresponding Private Key and as a result is the only person with the capability of decrypting the encrypted data back into its original form.
class Wallet {

    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');

    }
    sign(data) {
        //signature done using privatekey as well and the keypair has private key
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
        for (let i = 1; i < chain.length; i++) {

            const block = chain[i];
            for (const transaction of block.data) {

                let outputAddress = transaction.outputMap[address];

                if (outputAddress) {
                    outputTotal += outputAddress;
                }

            }

        }

        return STARTING_BALANCE + outputTotal;
    }
}

module.exports = Wallet;



/*--------Notes----------------*/
//1. A valid digital signature, where the prerequisites are satisfied, gives a recipient very strong reason to believe that the message was created by a known sender (authentication), and that the message was not altered in transit (integrity).

// 2.when a sender sends a message he will obtain a signature or sign(sign function does that) the
// message using its `privateKey and the data`
// then the person receiving the message will verify the signature using the incoming message and the sender's public key to ensure that message is incoming from the known user.

//for verification of signature what is done that the data from the signature is obtained and matched with the incoming data.

//for picture understanding see DigitalSignature.docx in documents

