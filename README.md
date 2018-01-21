# botit

Event driven chatbot client for node.js.

# Install
Using npm:

```
$ npm install botit
```

# Example
```javascript
const Bot = require('botit');
const config = require('../config/default.json');
const chatFlow = require('./router');
const dataFetch = require('./data');


/* Create a bot instance */
const bot = new Bot({
  chatFlow, 
  config, 
  apiConf, 
  dataFetch 
});

/** Bot listens for text-messages from the user */
bot.on('text-message', ({ senderID, messageText }) => {
	messageText = (typeof messageText === 'string') 
        ? messageText.trim() 
        : '';
    /**
     * 1. Make an API call to your preferred service.
     * 2. Get intents, entities for the message.
     * 3. Find the appropriate chatnode and make the bot speak.
     * 
     * In case of any errors, the bot responds with a
     * customizable error message!
     */
	bot.fetch.$http.get(`http://some-service.com?query=${messageText}`)
		.then(getInference)
		.then(botSpeak.bind(bot, senderID))
		.catch(botSpeakOnError.bind(bot, senderID));
});


/**
 * Handler gets inference from an API service
 */
function getInference (res) {
	const inference = res.data;
	const { intent, entities } = inference;
	return { intent, entities }
}

/**
 * After matching the intent with a node,
 * compile the message to provide the message templates
 * the variables needed.
 */
function compileNodeMessage (senderID, entities, smallTalk, node) {
	return node.message.compile({ id: senderID, entities, smallTalk })
}

/**
 * Send message via bot!
 */
function sendMessage (senderID, data) {
	console.log('bot.response', data, senderID);
	bot.reply(senderID, data);
}

/**
 * Handles errors in-case any
 */
function botSpeakOnError (senderID, err) {
	console.error('unreachable api', err);
	botSpeak(senderID, { intent: 'error' })
}

/**
 * With the inference provided, route the chat to
 * the node with the inferred intent.
 */
function botSpeak (senderID, inference) {
	const { intent, entities } = inference;
	bot.chat.go(senderID, { intent })
		.then(compileNodeMessage.bind(bot, senderID, entities))
		.then(sendMessage.bind(bot, senderID))
		.catch(botSpeakOnError.bind(bot, senderID));
}
```