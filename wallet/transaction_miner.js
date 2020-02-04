const Transaction = require('./transactions');
class TransactionMiner {

    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        //get the transaction pool's valid transaction
        let validTransactions = this.transactionPool.validTransactions();

        //generate miner's reward

        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })

        );

        //add a block consisting of the transactions to the blockchain

        this.blockchain.addBlock({ data: validTransactions });

        //broadcast the updated blockchain

        this.pubsub.broadcastChain();

        //clear the pool

        this.transactionPool.clear();
    }

}
module.exports = TransactionMiner;