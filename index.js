const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');
const app = express();
const request = require('request');
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
app.use(express.urlencoded());
app.get('/api/blocks', (req, res) => {
    console.log('this address');
    res.json(blockchain.chain);
});
app.post('/api/mine', (req, res) => {

    blockchain.addBlock(req.body.data);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});
//when the new peer joins he requests the root node to give him the lastest version of blockchain
const syncChain = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        console.log('this request')
        
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chai with sync on',rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
}
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT == 'true') {

    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    if(PORT!==DEFAULT_PORT){
        syncChain();
    }
    console.log(`listening on the port:${PORT}`);
});
