var loki = require('lokijs');
var fs = require('fs');
var db = new loki('db.json',{
    autoload: true,
    autosave: true, 
    autosaveInterval: 1000
});
exports.db = db;

//CRUD
exports.retrieveResponse = function(entity, intent) {
    var intentDB = db.addCollection('intentDB');
    if(entity!=null && intent!=null){
        var results = intentDB.findOne({entity: entity});
    }
    return results;
};

//Retrive Response
exports.selectIntent = function( entity, intent ) {
    var intentDB = db.getCollection('intentDB');
    var entryCount = db.getCollection("intentDB").count();
    var list = intentDB.find();
    var aEntity = entity;
    var aIntent = intent;
    var results;
    for(var i = 0; i < entryCount; i++) {                
        if(list[i].entity==entity && list[i].intent==intent){
            var responseTemp = list[i].response;
            var sillyString=responseTemp;
            results = {"entity":list[i].entity,"intent": list[i].intent,"response":responseTemp};
            break;
        }
    }
    return results;
};

// Add Secure Token to DB
exports.createToken = function(tokenStr) {
    var tokenDB = db.getCollection('Token');
    if (tokenDB === null) {
        tokenDB = db.addCollection('Token');
        tokenDB.insert({
            token: tokenStr
        });
    }
    else{  
        tokenDB.insert({
            token: tokenStr
        });
    }
    db.saveDatabase();
};

// Retrive Secure Token from DB
exports.selectToken = function(tokenStr) {
    var tokenDB = db.getCollection('Token');
    var entryCount = db.getCollection("Token").count();
    var list = tokenDB.find();
    var count=false;
    for(var i = 0; i < entryCount; i++) {    
        if(list[i].token==tokenStr ){                                                                 
            count=true;
        }                                                         
    }
    return count;
};

// Delete Secure Token from DB
exports.deleteToken = function(tokenStr){
    var tokenDB = db.getCollection('Token');
    var entryCount = db.getCollection("Token").count();
    var list = tokenDB.find();
    var count=false;
    var atokenStr = tokenStr;
    for(var i = 0; i < entryCount; i++) {                          
        if(list[i].token==tokenStr ){
            count=true;
            tokenDB.remove(list[i]);
        }
    }
    return count;
};