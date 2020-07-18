const Block = require("./block");
const hextoBinary = require("hex-to-binary");
const Transaction = require("../wallet/transactions");
const cryptoHash = require("../utilities/crypto-hash");
const { REWARD_INPUT, MINING_REWARD } = require("../config/config");
const Wallet = require("../wallet/wallet");
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }
  addBlock(data) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data: data,
    });

    this.chain.push(newBlock);
  }
  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];

      const actualLastHash = chain[i - 1].hash;

      const lastDifficulty = chain[i - 1].difficulty;

      if (Math.abs(difficulty - lastDifficulty) > 1) return false;

      if (lastHash !== actualLastHash) {
        return false;
      }

      const validHash = cryptoHash(timestamp, data, lastHash);

      if (
        validHash !== hash ||
        hextoBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
      )
        return false;
    }

    return true;
  }

  //this method is for verifying the transactional data in the incoming chain before replacement
  validTransactionData({ incomingChain }) {
    for (i = 1; i < incomingChain.length(); i++) {
      const block = incomingChain[i];
      let rewardTransactionCount = 0;
      const transactionset = new Set();
      for (let transaction of block.data) {
        if (transaction.inputAddress === REWARD_INPUT.address) {
          rewardTransactionCount++;
          if (rewardTransactionCount > 1) {
            console.error("Miner cant be rewarded more than once");
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner reward amout is invalid");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error("invalid transaction");
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });
          //calculating the balance based on our chain

          if (transaction.input.amount !== trueBalance) {
            return false; //i.e. the amount in the input was malacious
          }

          if (transactionset.has(transaction)) {
            return false; //duplicate transactions
          } else {
            transactionset.add(transaction);
          }
        }
      }
    }
  }
  replaceChain(newChain, onSuccess) {
    if (newChain.length <= this.chain.length) return;

    if (!Blockchain.isValidChain(newChain)) return;

    if (!this.validTransactionData({ incomingChain: newChain })) {
      return;
    }
    if (onSuccess) {
      onSuccess();
    }
    this.chain = newChain;
    return;
  }
}
module.exports = Blockchain;
