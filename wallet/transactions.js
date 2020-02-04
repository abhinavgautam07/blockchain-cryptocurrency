const uuid = require('uuid/v1');
const verifySignature = require('../utilities/elliptic').verifySignature;
const { REWARD_INPUT, MINING_REWARD } = require('../config/config');
class Transaction {
    //here recipient contains the public-key of the receiver
    constructor({ senderWallet, recipient, amount, outputMap, input }) {

        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, amount, recipient }) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;

    }

    createInput({ senderWallet, outputMap }) {
        return ({
            timestamp: Date.now(),
            address: senderWallet.publicKey,      //this is the public key of sender which needed for decrepting the signature
            amount: senderWallet.balance,
            signature: senderWallet.sign(outputMap) //output map is the data that will send
        });
    }

    update({ senderWallet, recipient, amount }) {
        let self = this;

        if (amount > self.outputMap[senderWallet.publicKey]) {
            throw new Error('Not enough funds');

        }

        //update output
        if (!self.outputMap[recipient]) {
            self.outputMap[recipient] = amount;
        } else {
            self.outputMap[recipient] += amount
        }

        self.outputMap[senderWallet.publicKey] -= amount;

        //update input
        self.input = self.createInput({ senderWallet, outputMap: self.outputMap });

        //the new signature was not generated
    }

    static validTransaction(transaction) { //or rather authenticTransaction

        //this function will be used by the receiver to validate the transaction
        const { input: { address, amount, signature }, outputMap } = transaction;


        const outputTotal = Object.values(outputMap)
            .reduce((total, output) => total + output);

        if (amount !== outputTotal) {

            return false;
        };

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {

            return false;
        }

        return true;
    }
    static rewardTransaction({ minerWallet }) {
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        });
    }
}

module.exports = Transaction;