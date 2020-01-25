const express = require('express');
const Blockchain = require('./blockchain/blockchain');
const PubSub = require('./config/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/wallet');
const app = express();
const request = require('request');
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain });
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
app.use(express.urlencoded());
app.get('/api/blocks', (req, res) => {
    console.log('this address');
    res.json(blockchain.chain);
});
app.post('/api/mine', (req, res) => {

    blockchain.addBlock(req.body.data); //here making changes in my instance of blockchain
    pubsub.broadcastChain(); //here  asking the others who will receive message to make chain in their instances
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    let { recipient, amount } = req.body;
    amount = parseFloat(amount);
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });
    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createtransaction({ recipient, amount });
        }

        //    console.log('wallet',wallet);

    } catch (e) {

        return res.status(400).json({ type: 'error', message: e.message });
    }

    transactionPool.setTransaction(transaction); //making change in my own instance of pool
    pubsub.broadcastTransaction(transaction);  //asking the others who will receive the  message to make change in their instances.
    // console.log('transaction pool', transactionPool);
    return res.status(200).json({ type: 'success', transaction });

});


app.get('/api/transaction-pool-map', (req, res) => {

    res.json(transactionPool.transactionMap);
})
//when the new peer joins he requests the root node to give him the lastest version of blockchain

const syncWithRoot = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {


        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            // console.log('replace chain with sync on', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {

        if (!error && response.statusCode === 200) {

            const rootPoolMap = JSON.parse(body);
            transactionPool.setMap({ newMap: rootPoolMap });
        }
    });
}
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT == 'true') {

    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    if (PORT !== DEFAULT_PORT) {
        syncWithRoot();
    }
    console.log(`listening on the port:${PORT}`);
});
