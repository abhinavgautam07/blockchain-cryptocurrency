const uuid = require("uuid/v1");
const verifySignature = require("../utilities/elliptic").verifySignature;
const { REWARD_INPUT, MINING_REWARD } = require("../config/config");
class Transaction {
  /*
    input map consists of information about sender only ..like the current balance in his wallet,his signature and his publicKey and also the timestamp of the transaction

    outputMap has information about both sender and receiver

    for sender it contains his publicKey mapped to his remaining balance in his wallet
    
    for receiver it contains his publicKey mapped to the totalAmount sent to him during this particular transaction not the totalBalance in his walllet

    ...recipient is basically public key of the receiver i.e address of his wallet
    */

  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuid();
    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, amount, recipient }) {
    const outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      address: senderWallet.publicKey, //this is the public key of sender which needed for decrepting the  signature
      amount: senderWallet.balance,
      signature: senderWallet.sign(outputMap), //output map is the data that will send
    };
  }

  update({ senderWallet, nextRecipient, nextAmount }) {
    let self = this;

    if (nextAmount > self.outputMap[senderWallet.publicKey]) {
      throw new Error("Not enough funds");
    }

    //update output
    if (!self.outputMap[nextRecipient]) {
      self.outputMap[nextRecipient] = nextAmount;
    } else {
      self.outputMap[nextRecipient] += nextAmount;
    }

    self.outputMap[senderWallet.publicKey] -= nextAmount;

    //update input
    self.input = self.createInput({ senderWallet, outputMap: self.outputMap });

    //the new signature was not generated as in javascript the objects are passed by refernce and the output is stll referncing the same object
    //we modify the crytohash func.
  }

  static validTransaction(transaction) {
    //or rather authenticTransaction

    //this function will be used by the receiver to validate the transaction
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total, output) => total + output
    );

    if (amount !== outputTotal) {
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      return false;
    }

    return true;
  }
  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}

module.exports = Transaction;
