


class appMongo{
  constructor(db,collection){
      this.db = db
      this.collection = collection
      this.url = 'mongodb://vishwesh1010:vishwesh101025@ds163530.mlab.com:63530/driving'
      this.MongoClient = require('mongodb').MongoClient;
      console.log("Initialize")
  }

  insertOne(data,callback,req,res,next){
      console.log("In mongo")
      var db_name = this.db
      var db_collection  = this.collection
      const MongoClient = this.MongoClient
      const MONGO_URL = this.url

      MongoClient.connect(MONGO_URL, function(err, db) {
      if(err) throw err
      var dbo = db.db(db_name);
      dbo.collection(db_collection).insert(data,
          function (err) {
              console.log(data._id)
          if (err) {
              db.close();
              return console.log(err);
          }
          callback(data,req,res,err,next)
          db.close();
          }
      )
      })
  }

  find(query,callback,req,res,next){
      var db_name = this.db
      var db_collection  = this.collection

      const MongoClient = this.MongoClient
      var url = this.url

      MongoClient.connect(url, function(err, db) {
          if(err) throw err
          var dbo = db.db(db_name);
          dbo.collection(db_collection).find(query).toArray(function(err, result) {
              db.close();
              callback(result,req,res,next,err)
          });
      });
  }

  findOne(query,callback,req,res,next){
      var db_name = this.db
      var db_collection  = this.collection

      const MongoClient = this.MongoClient
      var url = this.url

      MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db(db_name);
          dbo.collection(db_collection).findOne(query,function(err, result) {
              callback(result,req,res,next,err)
              db.close();
          });
      });
  }
}
module.exports = appMongo