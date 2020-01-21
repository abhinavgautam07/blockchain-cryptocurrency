const redis = require('redis');
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};
//when one instance of block chain adds new block it is his duty to broadcast this message about the new block addition
//by instance we mean a publisher or sunscriber
//each one have their own copy of blockchain.
class PubSub {
    constructor({blockchain}) {
        //every instance of pubsub will have a local blockchain
        this.blockchain=blockchain;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();
        
        this.susbcribeToChannels();

        this.subscriber.on(
            'message', (channel, message) => {
                this.handleMessage(channel, message);
            })
    }
    //part 2:replacing a chain whenever a longer and valid chain is received
    handleMessage(channel, message) {
        console.log(`message received.Channel:${channel}.Message:${message}.`);
        //when we receive the message we need to parse it and the subscriber or receiver will
        //replace its chain with the received chain
        const parsedMessage=JSON.parse(message);
        if(channel===CHANNELS.BLOCKCHAIN){
this.blockchain.replaceChain(parsedMessage);
        }
    }
    susbcribeToChannels(){
        Object.values(CHANNELS).forEach((channel)=>{
            this.subscriber.subscribe(channel);

        });
   }
   //Part1:braodcasting the chain if the new blocks are added
  async publish({channel,message}){
      try {
          await this.subscriber.unsubscribe(channel);
      await  this.publisher.publish(channel,message);
      await this.subscriber.subscribe(channel);
      } catch (e) {
      console.log(e);
      }
   }
   broadcastChain(){
       this.publish({
           channel:CHANNELS.BLOCKCHAIN,
           message:JSON.stringify(this.blockchain.chain)
       });
   }
}
module.exports = PubSub;