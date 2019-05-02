'use strict';

var cosmos = {};
var documentClient = require("documentdb").DocumentClient;
var url = require('url');

//DEMO DB

var endpoint = process.env.HOST || "https://agentactivationchatbotdemo.documents.azure.com:443/";
var primaryKey = process.env.AUTH_KEY || "ACWw0e3hYlGojikQaWCFJSVO3jMjGDZJ3Fu5rN1x4pvDI42wb3YlYFQeMKV0AwhrZosiN2aGLBI1V6p8KBgOGA==";

 

var database = {
	"id": "IntentDB"
};
var collection = {
	"id": "intentDB"
};


var client = new documentClient(endpoint, { "masterKey": primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${database.id}`;
var collectionUrl = `${databaseUrl}/colls/${collection.id}`;

/**
 * Get the database by ID, or create if it doesn't exist.
 * @param {string} database - The database to get or create
 */
function getDatabase() {
	

	return new Promise((resolve, reject) => {
		client.readDatabase(databaseUrl, (err, result) => {
			if (err) {
				if (err.code == HttpStatusCodes.NOTFOUND) {
					client.createDatabase(database, (err, created) => {
						if (err) reject(err)
						else resolve(created);
					});
				} else {
					reject(err);
				}
			} else {
				resolve(result);
			}
		});
		console.log(`database:\n${database.id} connected\n`);
	});
	
}

/**
 * Get the collection by ID, or create if it doesn't exist.
 */
function getCollection() {
	//console.log(`Getting collection:\n${collection.id}\n`);

	return new Promise((resolve, reject) => {
		client.readCollection(collectionUrl, (err, result) => {
			if (err) {
				if (err.code == HttpStatusCodes.NOTFOUND) {
					client.createCollection(databaseUrl, collection, { offerThroughput: 400 }, (err, created) => {
						if (err) reject(err)
						else resolve(created);
					});
				} else {
					reject(err);
				}
			} else {
				resolve(result);
			}
		});
	});
}


/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
function getFamilyDocument(document) {
	var documentUrl = `${collectionUrl}/docs/${document.id}`;
	return new Promise((resolve, reject) => {
		client.readDocument(documentUrl, (err, result) => {
			if (err) {
				console.log("read error" + JSON.stringify(err));
				if (err.code == HttpStatusCodes.NOTFOUND) {
					
					client.createDocument(collectionUrl, document, (err, created) => {
						if (err) 
						{
							console.log('family Function : '+JSON.stringify(err));
							reject(err);
							
						}						
						else
						{ resolve(created);
						console.log(created);
						}
					
					});
				} else {
					reject(err);
				}
			} else {
				resolve(result);
			}
		});
	});
};

/**
 * Query the collection using SQL
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */ 
 function getQueryCollection(entity, intent){	 
	   		
		try{
			var aEntity = entity;
	    	var aIntent = intent;
			return new Promise((resolve, reject) => {		
				client.queryDocuments(collectionUrl,
				//'SELECT VALUE c.response FROM intentDB c WHERE c.intent = "document.sign" and c.entity = "NA"'
				"SELECT VALUE c.response FROM intentDB c WHERE c.intent='"+aIntent+"' and c.entity='"+aEntity+"'"
				).toArray((err, results) => {
					console.log('results Query aEntity :'+aEntity);	
					console.log('intent'+aIntent);			
					resolve(results);
	  		   });
		     });
		}catch(e){
				console.log(e.stacktrace());
		}
    };


module.exports = {getDatabase:getDatabase,getCollection:getCollection,getFamilyDocument:getFamilyDocument,getQueryCollection:getQueryCollection};
