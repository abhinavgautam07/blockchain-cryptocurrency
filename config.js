//here we will store all the hardcoded blocks and global data
const MINE_RATE=1000;
const INITIAL_DIFFICULTY=3;
const GENESIS_DATA={
    timestamp:1,
    lastHash:'-----',
    hash:'hash-one',
    data:[],
    difficulty:INITIAL_DIFFICULTY,
    nonce:0
};
//we will import an object whose one and only key is GENESIS_DATA
module.exports={GENESIS_DATA,MINE_RATE};
