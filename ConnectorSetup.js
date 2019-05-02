
var dbcosmos = require('./CosmosDBConnector.js');
var azure= require('botbuilder-azure');
require('dotenv-extended').load();
module.exports = function() {
    
          
    var restify = require('restify');
    global.builder = require('botbuilder');
    
    var documentDbOptions = {
        host: 'https://agentactivationchatbotdemo.documents.azure.com:443/', // Host for local DocDb emulator
        masterKey: 'ACWw0e3hYlGojikQaWCFJSVO3jMjGDZJ3Fu5rN1x4pvDI42wb3YlYFQeMKV0AwhrZosiN2aGLBI1V6p8KBgOGA==', // Fixed key for local DocDb emulator
        database: 'IntentDB',
        collection: 'botdata'
    };
    
    var docDbClient = new azure.DocumentDbClient(documentDbOptions);
    
    var tableStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);



    var connector = new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
        });

      global.bot = new builder.UniversalBot(connector, [
                function (session) {
                var a = require("./app.js"); 
                a.myIntentHandler(session, session.message.text);
                }
            ]).set('storage', tableStorage); // // Storing bot data in Azure CosmoDB

    // Setup Restify Server
    var server = restify.createServer();
    var indexfile="";
    if(process.env.BOTStatus=="ON")
    {
        indexfile="index.html"; //maintenance.html
    } 
    server.listen(process.env.port || 3979, function () {
        console.log('%s listening to %s', server.name, server.url);
    });
    
    // Serve a static web page
    server.get(/.*/, restify.plugins.serveStatic({
    	'directory':__dirname, 
    	'default': indexfile
    }));
    
    server.post('/api/messages', connector.listen());
    };
    
        
    