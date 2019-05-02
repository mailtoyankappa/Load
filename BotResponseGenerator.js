require('dotenv-extended').load();
var kbconnect=require('./KBConnector.js');
var sasfnc=require('./sas.js');
var splunk = require('@dgs-chatbot/splunk-logger')(__filename);

var content_prompts="";
var buttons_prompts="";
var intent_prompts="";
var entity_prompts="";
var entityType_prompts="";

function MsgToBot(session,kbresponse,intent,entity)
{
    if(kbresponse!=null)
    {
        if(kbresponse.responsetag=="MultimediaResponse")
        {
            try 
            {
                if(kbresponse.answer.length>0  && kbresponse.linkarray.length>0 && kbresponse.iconarray.length>0)
                {
                    session.sendTyping();
                    MultiMediaResponse(session,intent,entity,kbresponse.answer,kbresponse.linkarray,kbresponse.iconarray,kbresponse.descarray);
                }
                else
                {
                    session.sendTyping();
                    session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                }
            } 
            catch (error) 
            {
                session.sendTyping();
                session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
            }
        }
        if(kbresponse.responsetag=="PromptsButtons")
        {
            try 
            {
                if(kbresponse.answer.length>0 && kbresponse.buttons.length>0)
                {
                    session.sendTyping();
                    Prompt_With_Choice(session,kbresponse.answer,kbresponse.buttons,intent,entity,kbresponse.entity_type);
                    console.log("inside prompt buttons");
                }
                else
                {
                    session.sendTyping();
                    session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                    
                }
            } 
            catch (error) 
            {
                session.sendTyping();
                session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
            }
        
        }
        if(kbresponse.responsetag=="Hyperlink")
        {
            try 
            {
                if(kbresponse.answer.length>0  && kbresponse.linktag.length>0 && kbresponse.link.length>0)
                {
                    session.sendTyping();
                    HyperLinkResponse(session,kbresponse.answer,kbresponse.linktag,kbresponse.link,intent);
                }
                else
                {
                    session.sendTyping();
                    session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                }
            } 
            catch (error) 
            {
                session.sendTyping();
                session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
            }
        }
        if(kbresponse.responsetag=="Text")
        {
            if(intent=="None")
            {
                try
                {
                    var anstagsarr= (kbresponse.answertags).split(",");
                    if(kbresponse.answertags.length>0 && (anstagsarr.indexOf("answerarray") > -1)==true && kbresponse.answerarray.length>0)
                    {
                        session.sendTyping();
                        var ArrOptions = kbresponse.answerarray;
                        var ans= ArrOptions[Math.floor(Math.random() * ArrOptions.length)];
                        Prompt_With_Text_None(session,ans);    
                    }
                    else
                    {
                        session.sendTyping();
                        session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                    }
                } 
                catch (error) 
                {
                    session.sendTyping();
                    session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                }
            }
            else if(intent!="None")
            {
                try 
                {
                    var anstagsarr= (kbresponse.answertags).split(",");
                    if(kbresponse.answertags.length>0 && (anstagsarr.indexOf("answer") > -1)==true && kbresponse.answer.length>0)
                    {
                        session.sendTyping();
                        Prompt_With_Text(session,kbresponse.answer);
                    }
                    else if(kbresponse.answertags.length>0 && (anstagsarr.indexOf("answerarray") > -1)==true && kbresponse.answerarray.length>0)
                    {
                        session.sendTyping();
                        var ArrOptions = kbresponse.answerarray;
                        var ans= ArrOptions[Math.floor(Math.random() * ArrOptions.length)];
                        Prompt_With_Text(session,ans);
                    }
                    else
                    {
                        session.sendTyping();
                        session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                    }
                } 
                catch (error) 
                {
                    session.sendTyping();
                    session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
                }
            }
        }
    }
    else
    {
        session.sendTyping();
        session.send("I&apos;m sorry, would you mind asking again differently? I can connect you with a live person if I still don&apos;t understand.");
    }       
}

//Helper Functions

//Prompt text Function
function Prompt_With_Text(session,Content,intent,entity)
{
    session.sendTyping();
    session.send(Content);
}

//Prompt_With_Text_None Function
function Prompt_With_Text_None(session,ans)
{   
    session.sendTyping();
    session.replaceDialog('Prompt_With_None',{"ans":ans});
}

bot.dialog('Prompt_With_None', [
    function (session,args) {
        if(process.env.SPLUNKTOGGLE=="ON")
        {
            splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid, "username" :  session.message.address.user.name ,"text": session.message.text,"Intent": "FallbackDefaultIntent","type": "FallbackDefault", env: process.env.SPLUNK_ENV});
        }
        builder.Prompts.text(session, args.ans);
    },
    function (session, results) {
        var resp= results.response;
        session.sendTyping();
        builder.LuisRecognizer.recognize(resp, process.env.LUIS_MODEL_URL, function (err, intents, entities) {
            if (intents) {
                var TopIntent = intents[0].intent;
                if( TopIntent!="None")
                {
                    var a = require("./app.js"); 
                    console.log("typeof a.myIntentHandler: "+typeof a.myIntentHandler);
                    session.send("You are in out of NONE :) : "+session.message.text);
                    a.myIntentHandler(session, session.message.text);
                }
                else if(TopIntent=="None"){
                    session.sendTyping();
                    var card= {
                        'contentType': 'application/vnd.microsoft.card.adaptive',
                        'content':{
                            "version": "1.0",
                            "type": "AdaptiveCard",
                            "body": [{
                                "type": "TextBlock",
                                "text": "I&apos;m sorry, I don&apos;t have the answer, so please click below if you&apos;d like to speak to a trainer. Please note, Training Connection hours are Monday-Friday **9:30 a.m. to 7:30 p.m. EST**  (excluding holidays).",
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
                        splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": resp,"Intent": "TrainerHandoffIntent","type": "TrainerHandoff", env: process.env.SPLUNK_ENV});
                    }
                }
                session.endDialog();
            }
        });
    }
]);

//Prompt Buttons Function
function Prompt_With_Choice(session,Content,Buttons,intent,entity,entitytype)
{
    content_prompts=Content;
    buttons_prompts=Buttons;
     session.userData.intent_prompts=intent;
    entity_prompts=entity;

    session.userData.entityType_prompts=entitytype;
    session.beginDialog('Prompt_With_Choice');
}

bot.dialog('Prompt_With_Choice', [
    function (session) {
        
        builder.Prompts.customize(builder.PromptType.choice, new builder.PromptChoice({minScore: 1.0}));
        builder.Prompts.choice(session,content_prompts,buttons_prompts,{listStyle:builder.ListStyle.button,maxRetries: 0});
    },
    function (session, results) {
        console.log("Prompt_With_Choice: intent_prompts: function results ");
        if(results.response)
        {
            var lowerentity=(results.response.entity)+"";
            var entity=session.userData.entityType_prompts+"_"+lowerentity.toLowerCase();
            //DB function
             console.log("Prompt_With_Choice: intent_prompts: "+ intent_prompts);
             console.log("Prompt_With_Choice: entity: "+ entity);
             kbconnect.retrieveAnswerDB(session.userData.intent_prompts,entity).then(function(data){
             var kbresponse = {intent: session.userData.intent_prompts, entity: entity, response: data[0]};
            if(kbresponse!=null)
            {
                MsgToBot(session,kbresponse.response,kbresponse.intent,kbresponse.entity); 
                 
            }
            
           });
            session.endDialog();
        }
        else
        {
            session.sendTyping();
            var a = require("./app.js"); 
            session.endDialog();
            a.myIntentHandler(session, session.message.text);
        }
          
    }
]);

//HyperLinkResponse Funtion
function HyperLinkResponse(session,Content,Tag,Link,intent)
{
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
                "title": Tag,
                "url": Link
            }]
        }
    };  
    var msg = new builder.Message(session)
        .addAttachment(card);
    session.sendTyping();
    session.send(msg);
    if(intent=="human.elevate" && process.env.SPLUNKTOGGLE=="ON")
    {
        splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": Content,"Intent": "BotMessageIntent","type": "BotMessage", env: process.env.SPLUNK_ENV});
        splunk.log('Conversation: ', { "conversationId": session.message.address.conversation.id,"userid" : session.message.address.user.userid,"username" :  session.message.address.user.name , "text": session.message.text,"Intent": "TrainerHandoffIntent","type": "TrainerHandoff", env: process.env.SPLUNK_ENV});
    }
}

//MultiMediaResponse Funtion
function MultiMediaResponse(session,intent,entity,Content,linkarray,iconarray,descarray)
{
    var blobNameArr=[];
    for(var g=0;g<linkarray.length; g++)
    {
        //split the url to get the blobname
        var blobTmp_Array = linkarray[g].split("/");
        blobNameArr.push(blobTmp_Array[blobTmp_Array.length-1]);
    }
    var linkarr=sasfnc.getsasurl(linkarray); 
    var imageset=[];
    var iconarr=iconarray;
    for(var i=0;i<linkarr.length;i++)
    {
        var cachebuster = Math.round(new Date().getTime() / 1000);
        iconarr[i]=iconarr[i]+"?cb="+cachebuster;
        blobNameArr[i]=blobNameArr[i].slice(0,-4);
        var is={
            "type": "ColumnSet",
            "columns": [
                {
                    "type": "Column",
                    "width": "auto",
                    "items": [
                        {
                        "type": "Image",
						"url" : iconarr[i],
						"title":blobNameArr[i],
						"selectAction" : {
							"type" : "Action.OpenUrl",
							"title" : "",
							"url" : linkarr[i]
							}
                        }
                    ]
                },
                {
                    "type": "Column",
                    "width": "auto",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "[" + descarray[i] + "](" + linkarr[i] + ")",
                            "wrap": true,
                            "size": "small",
					        "spacing": "none"
                        }
                    ]
                },
				{
					"type": "Column",
					"width": "stretch",
					"items": [
						{
							"type": "TextBlock",
							"text": "",
							"weight": "bolder",
							"spacing": "small"
						}
					]
				}
            ]
        };
        imageset.push(is);
    } 
    var card= {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content':{
            "version": "1.0",
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "TextBlock",
                    "text": Content,
                    "wrap":"true"
                },
                {
                   "type": "Container",
                    "items":imageset
                }      
            ]
        }
    };
    var msg=new builder.Message(session)
    .addAttachment(card);
    session.send(msg);
}

module.exports = { msgtobot:MsgToBot};



