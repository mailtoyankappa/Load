//=========================================================
// Agent Activation Chatbot Demo_ENV - Nationwide
//=========================================================

require('dotenv-extended').load();
require('./ConnectorSetup.js')();

var kbconnect = require('./KBConnector.js');
var botresp   = require('./BotResponseGenerator.js');
var splunk = require('@dgs-chatbot/splunk-logger')(__filename);

var LuisModelUrl=process.env.LUIS_MODEL_URL;
var bActiveNone = false;
var userid = '';
//=========================================================
// Welcome Dialog
//=========================================================
bot.on('event', function(message) { 
    if(message.name == 'requestWelcomeDialog'){
        message.address.bot.name=process.env.BOT_NAME;
        bot.send(new builder.Message()
            .address(message.address)
            .text("Hi **"+ message.user.name+"**, "+process.env.BOT_OPENS));
            
            if(process.env.SPLUNKTOGGLE=="ON")
            {
                splunk.log('Conversation Started: ', { "conversationId": message.address.conversation.id,"userid" : message.address.user.userid,"username" :  message.user.name , "text": "Hi "+ message.user.name+", "+process.env.Splunk_BOT_OPENS,"Intent": "WelcomeIntent","type": "BotMessage", env: process.env.SPLUNK_ENV});
            }
        }
});

//=========================================================
// Bot Middleware
//=========================================================
if(process.env.SPLUNKTOGGLE=="ON")
{
    bot.use({
        botbuilder: function (session, next) {
            
            // override the default session.error handler to include app logging
            session.error = function (err) {
                
                // reimplement session error
                var m = err.toString();
                err = err instanceof Error ? err : new Error(m);
                session.emit('error', err);
                session.logger.error(session.dialogStack(), err);
                session._hasError = true;
                
                // log the error
                logger.error(m);
                splunk.log('Error: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": m,"Intent": "BotErrorIntent","type": "ErrorMessage", env: process.env.SPLUNK_ENV});
                session.endConversation('Oops. Something went wrong. Type **Hello** to start over.');
                return session;
            };
            
            // log incomming messages
            if (session.message.text) {
                splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": session.message.text,"Intent": "UserMessageIntent","type": "UserMessage", env: process.env.SPLUNK_ENV});
            }
            next();
        }
    });
        
    var logBotConversation = (event) => {
        splunk.log('Conversation: ', { "conversationId": event.address.conversation.id,"userid" : event.address.user.userid, "username" :  event.address.user.name ,"text": event.text,"Intent": "BotMessageIntent","type": "BotMessage", env: process.env.SPLUNK_ENV});
    };
    
    // Middleware for logging
    bot.use({
        send: function (event, next) {
            logBotConversation(event);
            next();
        }
    });
}
//=========================================================
// Intent Dialogs
//=========================================================
function myIntentHandler(session, msg) {
    session.sendTyping();
    builder.LuisRecognizer.recognize(msg, LuisModelUrl,
    function (err, intents, entities) {
        if (err) {
            console.log("LUI Error: "+ err);
            session.send('Something went wrong. Type **Hello** to start over.');
        }
       
        if(intents[0].intent!=null && intents[0].score > (process.env.INTENTSCORETHRLD)){
            
        if(process.env.SPLUNKTOGGLE=="ON")
        {
            splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name ,"UserMessage" : session.message.text, "Intent_Score": intents[0].score,"Intent": intents[0].intent ,"type": "PredictedIntent", env: process.env.SPLUNK_ENV});
        }
            
            bActiveNone = false;
            switch (intents[0].intent) {
            case'quote.new':
                session.beginDialog('quote.new',{intent:intents[0].intent , entities:entities});
                break;
            case'report.order':
                session.beginDialog('report.order',{intent:intents[0].intent , entities:entities});
                break;
            case'training.find':
                session.beginDialog('training.find',{intent:intents[0].intent , entities:entities});
                break;
            case'term.define':
                session.beginDialog('term.define',{intent:intents[0].intent , entities:entities});
                break;
            case'policy.umbrella.add':
                session.beginDialog('policy.umbrella.add',{intent:intents[0].intent , entities:entities});
                break;
            case'None':
                bActiveNone = true;
                if (msg.match(process.env.REGEXEXP)) // Check whether the input contains a 10 digit US phone number
            
                {
                    noneSecondResp(session);
                    break;
                 }
                else
                {
                session.beginDialog('None',{intent:intents[0].intent , entities:entities});
                break;
                }
            default:
                if (msg.match(process.env.REGEXEXP)) // Check whether the input contains a 10 digit US phone number
            
                {
                    noneSecondResp(session);
                    break;
                 }
                 else
                 {
                session.beginDialog('defaultDialog',{"intent":intents[0].intent , "entities":entities});
                break;
                 }
            }
        }
        else{
            if(bActiveNone==false){
                bActiveNone = true;
                if (msg.match(process.env.REGEXEXP)) // Check whether the input contains a 10 digit US phone number
                
                {
                    noneSecondResp(session);
                 }
                 else
                 {
                session.beginDialog('None',{intent:intents[0].intent , entities:entities});
                 }
            }
            else{
                bActiveNone = false;
                noneSecondResp(session);   
            }
        }
    });
}

//=========================================================
// Bot Dialogs
//=========================================================

bot.dialog('quote.new', [
    function (session, args, next) {
        var TopIntent = "";
        var dbEntity="";
        console.log("quote new");
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'quote.type');
        if(answerEntity)
        {
            TopIntent = args.intent;
            dbEntity="quote.type"+"_"+answerEntity.entity;
        }
        else
        {
            TopIntent = args.intent;
            dbEntity="NA";
        }
        kbconnect.retrieveAnswerDB(TopIntent,dbEntity).then(function(data){
        var kbresponse = {intent: TopIntent, entity: dbEntity, response: data[0]};
        console.log(kbresponse);
        
        session.sendTyping();
        if(kbresponse!=null)
        {
            session.endDialog();
            botresp.msgtobot(session,kbresponse.response,kbresponse.intent,kbresponse.entity);      
        }
        else
        {
            session.sendTyping();   
            var kbresp={
                "responsetag": "Text",
                "answertags": "answerarray",
               "answerarray": ["I&apos;m sorry, I wasn&apos;t able to find an answer to your question. Could you please re-phrase that?"]
            };
            session.endDialog();    
            botresp.msgtobot(session,kbresp,"None","NA");
       }
     });
      
    }
]);


bot.dialog('report.order', [
    function (session, args, next) {
        var TopIntent = "";
        var dbEntity="";
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'report.type');
        if(answerEntity)
        {
            TopIntent = args.intent;
            dbEntity="report.type"+"_"+answerEntity.entity;
        }
        else
        {
            TopIntent = args.intent;
            dbEntity="NA";
        }
        kbconnect.retrieveAnswerDB(TopIntent,dbEntity).then(function(data){
        var kbresponse = {intent: TopIntent, entity: dbEntity, response: data[0]};
        session.sendTyping();
        if(kbresponse!=null)
        {
            session.endDialog();
            botresp.msgtobot(session,kbresponse.response,kbresponse.intent,kbresponse.entity);      
        }
        else
        {
            session.sendTyping();   
            var kbresp={
                "responsetag": "Text",
                "answertags": "answerarray",
               "answerarray": ["I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand."]
            };
            session.endDialog();    
            botresp.msgtobot(session,kbresp,"None","NA");
       }
      });
    }
]);

bot.dialog('training.find', [
    function (session, args, next) {
        var TopIntent = "";
        var dbEntity="";
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'training.subject');
        if(answerEntity)
        {
            TopIntent = args.intent;
            dbEntity="training.subject"+"_"+answerEntity.entity;
        }
        else
        {
            TopIntent = args.intent;
            dbEntity="NA";
        }
        kbconnect.retrieveAnswerDB(TopIntent,dbEntity).then(function(data){
        var kbresponse = {intent: TopIntent, entity: dbEntity, response: data[0]};
        session.sendTyping();
        if(kbresponse!=null)
        {
            session.endDialog();
            botresp.msgtobot(session,kbresponse.response,kbresponse.intent,kbresponse.entity);      
        }
        else
        {
            session.sendTyping();   
            var kbresp={
                "responsetag": "Text",
                "answertags": "answerarray",
               "answerarray": ["I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand."]
            };
            session.endDialog();    
            botresp.msgtobot(session,kbresp,"None","NA");
       }
      });
    }
]);

bot.dialog('term.define', [
    function (session, args, next) {
        var TopIntent = "";
        var dbEntity="";
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'term.name');
        if(answerEntity)
        {
            TopIntent = args.intent;
            dbEntity="term.name"+"_"+answerEntity.entity;
        }
        else
        {
            TopIntent = args.intent;
            dbEntity="NA";
        }
        kbconnect.retrieveAnswerDB(TopIntent,dbEntity).then(function(data){
        var kbresponse = {intent: TopIntent, entity: dbEntity, response: data[0]};
        session.sendTyping();
        if(kbresponse!=null)
        {
            session.endDialog();
            botresp.msgtobot(session,kbresponse.response,kbresponse.intent,kbresponse.entity);      
        }
        else
        {
            session.sendTyping();   
            var kbresp={
                "responsetag": "Text",
                "answertags": "answerarray",
               "answerarray": ["I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand."]
            };
            session.endDialog();    
            botresp.msgtobot(session,kbresp,"None","NA");
       }
      });
    }
]);

bot.dialog('policy.umbrella.add', [
    function (session, args, next) {
        var TopIntent = "";
        var dbEntity="";
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'policy.umbrella.add.option');
        if(answerEntity)
        {
            TopIntent = args.intent;
            dbEntity="policy.umbrella.add.option"+"_"+answerEntity.entity;
        }
        else
        {
            TopIntent = args.intent;
            dbEntity="NA";
        }
        kbconnect.retrieveAnswerDB(TopIntent,dbEntity).then(function(data){
        var kbresponse = {intent: TopIntent, entity: dbEntity, response: data[0]};
        session.sendTyping();
        if(kbresponse!=null)
        {
            session.endDialog();
            botresp.msgtobot(session,kbresponse.response,kbresponse.intent,kbresponse.entity);      
        }
        else
        {
            session.sendTyping();   
            var kbresp={
                "responsetag": "Text",
                "answertags": "answerarray",
                "answerarray": ["I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand."]
            };
            session.endDialog();    
            botresp.msgtobot(session,kbresp,"None","NA");
       }
      });
    }
]);

bot.dialog('None',[
    function (session,args) {
        builder.Prompts.text(session, "I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
        
        if(process.env.SPLUNKTOGGLE=="ON")
        {
            splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid, "username" :  session.message.address.user.name ,"text": session.message.text,"Intent": "FallbackDefaultIntent","type": "FallbackDefault", env: process.env.SPLUNK_ENV});
        }
    },
    function (session, results) {
        var resp= results.response;
        session.sendTyping();
        builder.LuisRecognizer.recognize(resp, LuisModelUrl, function (err, intents, entities) {
            if (intents) {
                var TopIntent = intents[0].intent;
                if( TopIntent!="None")
                    {
                         session.endDialog();
                         myIntentHandler(session, session.message.text);
                    }
                    else if(TopIntent=="None"){
                        if(process.env.SPLUNKTOGGLE=="ON")
                        {
                            splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": resp,"Intent": "FallbackDefaultIntent","type": "FallbackDefault", env: process.env.SPLUNK_ENV});
                        }
                        noneSecondResp(session);
                    }
                    session.endDialog();
            }
        });
    }
]);

bot.dialog('defaultDialog',[
    function (session,args,next){
        if(args.intent!=null)
        {
            var TopIntent = args.intent;
            var dbEntity="NA";
            kbconnect.retrieveAnswerDB(TopIntent,dbEntity).then(function(data){
            var kbresponse = {intent: TopIntent, entity: dbEntity, response: data[0]};
            session.sendTyping();
            if(kbresponse!=null)
            {
                session.endDialog();
                botresp.msgtobot(session,kbresponse.response,kbresponse.intent,kbresponse.entity);
                console.log("inside default dialog");
            }
            else
            {
                session.sendTyping();
                var kbresp={
                    "responsetag": "Text",
                    "answertags": "answerarray",
                    "answerarray": [
    					"I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand."
    				]
                };
                session.endDialog();
                botresp.msgtobot(session,kbresp,"None","NA");
            }
          });
        }
        else 
        {
            session.sendTyping();
            var kbresp={
                "responsetag": "Text",
                "answertags": "answerarray",
                "answerarray": [
					"I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand."
				]
            };
            session.endDialog();
            botresp.msgtobot(session,kbresp,"None","NA");
        }
    }
]);

function noneSecondResp(session)
{
    session.sendTyping();
    var Content="I&apos;m sorry, I don&apos;t have the answer, so please click below if you&apos;d like to speak to a trainer. Please note, Training Connection hours are Monday-Friday **9:30 a.m. to 7:30 p.m. EST** (excluding holidays).";
    var card= {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content':{
            "version": "1.0",
            "type": "AdaptiveCard",
            "body": [{
                "type": "TextBlock",
                "text": Content,
                "wrap": "true"
            }],
            "actions": [{
                "type": "Action.OpenUrl",
                "title": "Chat with a trainer",
                "url": process.env.Click_to_Chat_URL
            }]
        }
    };
    var msg = new builder.Message(session)
        .addAttachment(card);
    session.sendTyping();
    session.send(msg);
    if(process.env.SPLUNKTOGGLE=="ON")
    {
        splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": Content,"Intent": "BotMessageIntent","type": "BotMessage", env: process.env.SPLUNK_ENV});
    }
}

function myNoneDialogFnc(session)
{
    session.beginDialog('None');
}


module.exports = { myIntentHandler:myIntentHandler,myNoneDialogFnc:myNoneDialogFnc};
