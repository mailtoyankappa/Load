# AGENT ACTIVATION CHATBOT

TABLE OF CONTENTS:

Introduction
Prerequisites
Environment
Build and Publish the LUIS model
Register the Web Bot application
Build Web App Bot application
Run Web App Bot application
*Deployment
Questions and comments



#INTRODUCTION

This repository contains a code for AgentActivationChatbot, a bot that would enable agents to get immediate answers to FAQ's and fetch job aid's, video snacks and eLearning modules etc for them. 

The Agent Accelerator ChatBot will be the first line of contact,  transferring context and interaction to a human live-chat when either the ChatBot detects struggle or requested by the Agent. 


#PREREQUISITES

The minimum prerequisites to run this sample are:

- Latest Node.js with NPM. 
- The Bot Framework Emulator.
- Register your bot with the Microsoft Bot Framework. Please refer to this link (https://dev.botframework.com/) for the instructions. Once you complete the registration, update your bot configuration with the registered config values (See Debugging locally using ngrok or Deploying to Azure)
- [Recommended] Visual Studio Code for IntelliSense and debugging. 
- A Language Understanding Intelligent Service subscription
- splunk service
	@dgs-chatbot/authentication
	@dgs-chatbot/claims-administration
	@dgs-chatbot/logger
	@dgs-chatbot/splunk-logger
- db.json - In Memory DB (Loki JS) Schema file.

# Environment

In addition to the dependencies' environment variables:

MICROSOFT_APP_ID - app id of bot created with the Microsoft Bot Framework
MICROSOFT_APP_PASSWORD app password of bot created with the Microsoft Bot Framework
LUIS_URL - the url generated when you publish a Luis app


#BUILD Web App Bot application:

In a command prompt, run the following command in the root directory. This installs the project dependencies.

npm install

Run the following command to start the development server-

npm start

Bot application opens in index.html consuming directline as a channel or use bot emulator to simulate the bot flow.


#RUN Web App Bot application:

Try saying Hi/Hello etc.,.

Ask Policy Center FAQ's and get the responses from the bot.

Enter "Trainer" at anytime in the bot flow to connect to Human-Agent for additional help.

# Deployment

//In progress

#QUESTIONS AND COMMENTS:

//We'd love to get your feedback about the Agent Activation Chatbot for Node.js. You can send your questions and suggestions in the Issues section of this bot application.


