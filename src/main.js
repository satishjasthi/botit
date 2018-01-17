const bluebird = require('bluebird');
const Bot = require('../Bot');
const config = require('../config/default.json');
const chatFlow = require('./router');
const nodeMap = require('./map/index');

const bot = new Bot({ chatFlow, config });


bot.on('server-started', ({ senderId, messageText = 'hey' }) => {
  console.log('===== test mode active =====');
  const { intent, entities } = { intent: 'greeting', entities: {} };
  bot.chat.go(senderId, nodeMap(intent))
    .then(node => {
      return node.message.compile({ id: senderId, entities })
    })
    .then(data => {
      console.log('bot.response', data, senderId);
      // bot.reply(senderId, data);
    })
});

bot.on('text-message', ({ senderID, messageText }) => {
	console.log('===== online test mode active =====');
	console.log('inputs', senderID, messageText);
	const { intent, entities } = { intent: 'greeting', entities: {} };
	bot.chat.go(senderID, nodeMap(intent))
		.then(node => {
			return node.message.compile({ id: senderID, entities })
		})
		.then(data => {
			console.log('bot.response', data, senderID);
			bot.reply(senderID, data);
		})
});