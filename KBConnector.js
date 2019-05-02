
var dbcosmos = require('./CosmosDBConnector.js');
var kbresponse, temp;

function retrieveAnswer(TopIntent,EntityArray) {
   
    return new Promise((resolve, reject) => {
     dbcosmos.getDatabase()
        .then(() => dbcosmos.getCollection())
	    .then(() => dbcosmos.getQueryCollection(EntityArray,TopIntent).then(function(data){
           
            resolve(data);
        }));		
        });
    
}

module.exports = { retrieveAnswerDB:retrieveAnswer};