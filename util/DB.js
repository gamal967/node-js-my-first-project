const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

const mongoConnect=(callback)=>{
  console.log('Connecting...');
  MongoClient.connect(
    process.env.MONGODB_URI
  )
    .then(client=>{
      console.log('Connected!');
      callback(client);
    })
    .catch(err=>{console.log(err)});

}

module.exports=mongoConnect;