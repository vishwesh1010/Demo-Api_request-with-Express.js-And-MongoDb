const express = require('express')
const app = express.Router()
var ObjectID = require('mongodb').ObjectID

var appMongo = require("./appMongo")

var property_coll = new appMongo("user64","Property")
var property_unit_coll = new appMongo("user64","PropertyUnit")
var assets_coll = new appMongo("user64","Asset")
var properties = new appMongo("user64","Properties")
var employee = new appMongo("user64","Employee")



app.get('/getall',(req,res,next)=>{
    property_coll.connect((collection,db,req,res,next,err)=>{
        collection.aggregate([
            { $lookup:
               {
                 from: 'PropertyUnit',
                 localField: '_id',
                 foreignField: 'PropertyUnit',
                 as: 'Units'
               }
             }
            ]).toArray(function(err, result) {
            if (err) throw err;
            //console.log((res));
            res.send(result)
            db.close();
          });
    },req,res,next)
    
})

app.post('/insert_tanent',(req,res,next)=>{
    var value = req.body

    property_unit_coll.connect((collection,db,req,res,next,err)=>{
    console.log(value,"value")
    collection.update(
        {Name:"C-231"},
        { $push:
           {
             tenant:{
                 $each:[value]
             }
           }
         }
        )
    })
})

function asset(req,res,next){
    const asset_type = [{
        name:["Name_AA","Name_AB","Name_AC",'Name_AD','Name_AE','Name_AF'],
        type:"Type_A"
    }, {
        name:["Name_BA","Name_BB","Name_BC",'Name_BD','Name_BE','Name_BF','Name_BG','Name_BH'],
        type:"Type_B"
    },
    {
        name:["Name_CA","Name_CB","Name_CC",'Name_CD','Name_CE','Name_CF'],
        type:"Type_C"
    },
    {
        name:["Name_DA","Name_DB","Name_DC",'Name_DD','Name_DE','Name_DF'],
        type:"Type_D"
    }
]
   
    l = []
    for(var i = 0;i<20;i++ ){
        var name_l = Math.floor(Math.random() * asset_type[0].name.length);
        var type_l = Math.floor(Math.random() * asset_type.length);
        l.push({name:makeText(1),type:asset_type[type_l].type})
    }

    assets_coll.connect((collection,db,req,res,next,err)=>{
        collection.insertMany(l)
    })

    console.log(l)
    res.send("success")
}

function makeText(n) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for(var j=0;j<n;j<j++){
        for (var i = 0; i < Math.floor(Math.random() * 8 + 3); i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        text+=" "
    }
    return text
}

function makeNumber(n) {
    var text = "";
    var possible = "1234567890";
    for (var i = 0; i <= n; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text
}

function createProperty(n,req,res,next){
    var l = []
    for(var i=0; i<n+1; i++){
        var r = Math.floor(Math.random() * 8 + 3)
        l.push({Name:makeText(2),Address:makeText(r)})
    }
    property_coll.connect((collection,db,req,res,next,err)=>{
        collection.insertMany(l)
    },req,res,next)
    console.log(l)
}

function createUnits(n,req,res,next){
    property_coll.find({},(property_list,req,res)=>{
        var l = []
        for(var i = 0; i < n; i++){
            var rand = Math.floor(Math.random() * property_list.length)
            var unit = {
                Name:makeText(2),
                Property_id:new ObjectID(property_list[rand]._id)
            }
            l.push(unit)
        }
        console.log(l)
    property_unit_coll.insertMany(l,(result,req,res)=>{
        res.send("Inserted")
    },req,res,next)

    },req,res,next)
}




function lookupcallback(collection,db,req,res,next,err){
    collection.aggregate([
        { $lookup:
           {
             from: 'PropertyUnit',
             localField: '_id',
             foreignField: 'Property_id',
             as: 'Units'
           }
         },
         {$project:{ "_id":1,"Name":1,"Address":1,"Units._id":1 }}
        ]).toArray(function(err, result) {
        if (err) throw err;
        //properties.insertMany(result,()=>{},req,res,next)
        console.log(result);
        res.send(result)
        
      });
      //next()
}

function createTenant(n){
    var l = []
    for(var i = 0; i < n; i++){
        var tanent = {
            _id:new ObjectID(),
            Name:makeText(2),
            Contact:makeNumber(10),
            Email:makeText(1)+ "@gmail.com"
        }
        l.push(tanent)
    }
    return l
}

function addTanentsToUnits(n_u,n_t,req,res,next){
    assets_coll.find({},(assets_list)=>{
        property_unit_coll.find({},(units_list,req,res)=>{
            
            for(var i = 0; i < n_u; i++){
                var rand_assets = createAssets(assets_list)
                var rand_unit = units_list[Math.floor(Math.random() * units_list.length)]
                var tanents = createTenant(n_t)
                console.log(tanents)
                console.log(rand_unit)

                property_unit_coll.updateOne({_id:rand_unit._id},{$set: {Tanents:tanents,Assets:rand_assets}},()=>{console.log("Updated")},req,res,next)
                //property_unit_coll.updateOne({_id:rand_unit._id},{$set: {Assets:rand_assets}},()=>{console.log("Updated")},req,res,next)
            }
        },req,res,next)
    },req,res,next)

}

function createEmployee(n,req,res,next){
    var l = []
    employee.find({},(emp_list,req,res)=>{

    assets_coll.find({},(assets_list)=>{

        for( var i = 0; i<n ;i++){
            var rand_emp = emp_list[Math.floor(Math.random() * emp_list.length)]

            var rand_asset = assets_list[Math.floor(Math.random() * assets_list.length)]
            var emp = {
                Name:makeText(2),
            }
            l.push(emp)
            employee.updateOne({_id:rand_emp._id},{$push:{asset_type:rand_asset.type} },()=>{console.log("Updated")},req,res,next)

        }
        console.log(l)
        //employee.insertMany(l,()=>{console.log("Inserted")},req,res,next)
    },req,res,next)
},req,res,next)

}

function addAssetsToUnits(n,req,res,next){

    assets_coll.find({},(assets_list)=>{

        property_unit_coll.find({},(units_list)=>{
            for(var i = 0;i < n ;i++){
                //var rand_number = Math.floor(Math.random() * 15)
                var rand_assets = createAssets(assets_list)
                var rand_unit = units_list[Math.floor(Math.random() * units_list.length)]
                console.log(rand_assets)
                property_unit_coll.updateOne({_id:rand_unit._id},{$set: {Assets:rand_assets}},()=>{console.log("Updated")},req,res,next)
            }
            console.log("Updated")
        },req,res,next)
        
    },req,res,next)
    
}

function createAssets(assets_list){
    var l = []
    var n = Math.floor(Math.random() * 15)
        for(var i = 0;i < n ;i++){
            var rand_asset = assets_list[Math.floor(Math.random() * assets_list.length)]
            var rand_number = Math.floor(Math.random() * assets_list.length)

            var asset = {
                Asset_id:rand_asset._id,
                Number:rand_number
            }
            l.push(asset)
        }
    return l
}

app.get('/create_property',(req,res,next)=>{
    console.log(createProperty(10,req,res,next))
})

app.get('/create_units',(req,res,next)=>{
    createUnits(100,req,res,next)
})

app.get('/create_tanents',(req,res,next)=>{
    addTanentsToUnits(50,1,req,res,next)
})

app.get('/lookup',(req,res,next)=>{
    console.log("IN LOOKUP")
    property_coll.connect(lookupcallback,req,res,next)
})
app.get("/create_assets",(req,res,next)=>{
    asset()
});
app.get("/add_assets",(req,res,next)=>{
    addAssetsToUnits(10,req,res,next)
})

app.get("/create_emp",(req,res,next)=>{
    createEmployee(20,req,res,next)
})

app.get("/find",(req,res,next)=>{
   property_unit_coll.find({},(result,req,res)=>{
       console.log(result)
       res.send(result)
    },req,res,next)
})


function getTenantsList(Property_id,req,res,next){
    property_unit_coll.connect((collection,db)=>{
        collection.aggregate(
            [{$match:{Property_id:Property_id}},
            {$project:{"Tanents":1,"Property_id":1}},
            {$unwind:"$Tanents"},
            {$group:{
                _id:"$Property_id",
                Tanents:{$push:"$Tanents"}
            }}
        ]
        ).toArray(function(err, result) {
            console.log(result)
            res.send(result)
        })
        
    },req,res,next)
}

function getEmployee(callback,asset_type,date,time,req,res,next){
    employee.connect((collection,db)=>{
        //first match type 
        //elemMatch iterate documents in array 
        //so we compare date if data in ne to input date or if date in equal to input date then time must be not equal
        collection.find({asset_type:asset_type,$or:[
                        {apmt:{"$elemMatch":{
                            $or:[
                                {date:{$ne:date}},
                                {date:date,time:{$ne:time}}]
                                }
                            }
                        },
                        //if apmt not exists
                        {apmt:null}]

                    }).toArray(function(err,result){
                //console.log(result)
                //res.send(result)
                callback(result)
            })
        })
    
}


function createRequest(tanent_id,asset_type,unit_id,date,time,req,res,next){
    getEmployee((result)=>{
        var rand_emp =  result[Math.floor(Math.random() * result.length)]
        var req_id = new ObjectID()
        console.log(rand_emp)
        property_unit_coll.connect((collection,db)=>{
            //push requests in request in property_unit where id match
            collection.findOneAndUpdate({_id:unit_id},{
               $push: {request:{tanent_id:tanent_id,
                request_id:req_id,
                asset_type:asset_type,
                date:date,
                time:time,
                status:"pending",
                emp_id:rand_emp._id}}
            },{new:true},(err,result)=>{
                console.log("updated",result)
                var emp_id = rand_emp._id
                employee.connect((collection,db)=>{
                    collection.findOneAndUpdate({_id:emp_id},{
                        //addToSet is push with not duplicate
                        $addToSet:{
                            apmt:{
                                _id:new ObjectID(),
                                req_id:req_id,
                                date:date,
                                time:time,
                                status:"pending"
                            }
                        }
                    },(err,result)=>{
                        console.log("apmt",result)
                    })
                })
            })
        },req,res,next)


    },asset_type,date,time,req,res,next)
    /*
    property_unit_coll.connect((collection,db)=>{
        collection.update({_id:unit_id},{
           $push: {tanent_id:tanent_id,
            asset_type:asset_type,
            date:date,
            time:time,
            status:"pending",
            emp_id:emp_id}
        })
    },req,res,next)
    */


}

app.get("/get_tenants",(req,res,next)=>{
    var _id  = new ObjectID("5b31c4506ea94d047b79d51f")
    getTenantsList(_id,req,res,next)
})


app.get("/get_emp",(req,res,next)=>{
    getEmployee((result)=>{
        console.log("result:",result)
    },"Type_A","26","morning",req,res,next)
})

app.get("/create_req",(req,res,next)=>{
    var unit_id = new ObjectID("5b31e9ec5c024610a356d24b")

    createRequest("QDMVC XQQSXSG ","Type_A",unit_id,"26","morning",req,res,next)
})



module.exports = app

