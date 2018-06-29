var express = require('express');
var app = express()
var appMongo = require("./appMongo")

var bodyParser = require('body-parser');


var notesMongo = new appMongo("driving","books")



function callback(data,req,res,next,err){
  res.send(data)
  next()
}

function callbackInsert(data,req,res,next,err){
  res.send("inserted at : "+data._id)
}

app.get('/books',(req,res,next)=>{
    console.log("books") 
     const key = req.query.title
    notesMongo.find({title:key},callback,req,res,next)
},(req,res)=>{console.log("World")});

app.use(bodyParser.urlencoded({extended: true}))
app.post('/insert',(req,res,next)=>{
  console.log(req.body)
  const key = req.body.title
  const key2 = req.body.genres
  notesMongo.insertOne({title:key,genres:key2},callbackInsert,req,res,next)
})

app.get('/', (req, res) => {
    res.send('Hello World !');
});


app.listen(2000);
