const bluebird = require('bluebird');
const Bot = require('../Bot');
const config = require('../config/default.json');
const chatFlow = require('./router');
const nodeMap = require('./map/index');

const apiConf = {
	baseURL: 'http://192.168.0.80:8080/api/resto'
};

const bot = new Bot({ chatFlow, config, apiConf });

const getInference = res => {
	const inference = res.data;
	const { query, intent, entities } = inference;
	const smallTalk = inference['small-talk'].reply;
	return { query, intent, entities, smallTalk }
};

const botSpeak = (senderID, inference) => {
	const { query, intent, entities, smallTalk } = inference;
	bot.chat.go(senderID, { intent })
		.then(node => {
			return node.message.compile({ id: senderID, entities, smallTalk })
		})
		.then(data => {
			console.log('bot.response', data, senderID);
			bot.reply(senderID, data);
		}).catch(err => {
			console.error(err);
		});
};

bot.on('text-message', ({ senderID, messageText }) => {
	console.log('===== online test mode active =====');
	messageText = (typeof messageText === 'string') ? messageText.trim() : '';

	console.log('inputs', senderID, messageText);
	bot.fetch.$http.get(`http://192.168.0.80:8080/api/resto/get_nlu?resto_name=menu1&query=${messageText}`)
		.then(getInference)
		.then(botSpeak.bind(bot, senderID))
		.catch(err => {
			console.error(err);
			const intent = 'error';
			botSpeak(senderID, {intent: 'error'})
		});
});