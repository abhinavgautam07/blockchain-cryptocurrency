const crypto = require('crypto');
const cryptoHash = (...inputs) => {
    const sortedInput = inputs.map((input) => { return JSON.stringify(input) })
        .sort().join(' '); //to make sure hash is same for different orders in which inputs are passed
    //join will add the elements of 


    const hash = crypto.createHash('sha256');
    
    hash.update(sortedInput);
    return hash.digest('hex');
};



module.exports = cryptoHash;