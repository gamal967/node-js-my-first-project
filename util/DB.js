const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect=(callback)=>{
  console.log('Connecting...');
  MongoClient.connect(
    'mongodb://gamalelctron2332_db_user:gggmmmlll333@ac-0pastqb-shard-00-00.akdhoiv.mongodb.net:27017,ac-0pastqb-shard-00-01.akdhoiv.mongodb.net:27017,ac-0pastqb-shard-00-02.akdhoiv.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-ogso4t-shard-0&authSource=admin&appName=Cluster0'
  )
    .then(client=>{
      console.log('Connected!');
      _db=client.db();
      callback();
    })
    .catch(err=>{
      console.log(err)
      throw err;
    });

}

const getDb=()=>{
  if(_db){
    return _db;
  }
  throw 'No database found';
}

exports.mongoConnect=mongoConnect;
exports.getDb=getDb;