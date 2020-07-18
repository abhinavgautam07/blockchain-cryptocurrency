
// // in javascript objects and arrays are passed by refrence

// objects
// const fun=(obj)=>{
//     for (const key in obj) {
//        obj[key]++;
//     }
// }

// let abc={
//     a:12,
//     b:13,
//     c:14
// }
// console.log('before',abc);
// fun(abc);

// console.log('after',abc);



// // arrays
// const fun=(obj)=>{
//   for (let index = 0; index < obj.length; index++) {
//   obj[index]++
      
//   }
// }

// let abc=[12,13,14]
// console.log('before',abc);
// fun(abc);

// console.log('after',abc);

// const ps=require('./config/pubsub');

// let nps=new ps({
//   blockchain:'bc',
//   transactionPool:'tp'
// });

// // console.log(typeof(nps));  --------> it gives object

const {ec}=require('./utilities/elliptic');

class Test{

  constructor(){
    this.keyPair=ec.genKeyPair();

    this.publicKey=this.keyPair.getPublic().encode('hex');
      this.data=this.keyPair.sign("abhinav");
    console.log(this);
  }
}

const t=new Test();

// console.log("new",t);