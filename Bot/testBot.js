const BotMaker = require('./');
const config = require('../config/default.json');

const bot = new BotMaker(config);
bot.init();

bot.on('test-event', (data) => { console.log(data) });

bot.on('text-message', ({ senderID, messageText }) => {
	switch (messageText) {
		case 'QR_TEST': bot.promptQuickReplies(senderID, {
			promptText: 'Do you like what you see?',
			quickReplies: [{
				title: 'Yes',
				payload: '1'
			}, {
				title: 'No',
				payload: '0'
			}]
		}); break;
		case 'QR_LOC': bot.promptLocation(senderID, {
			promptText: 'Where do you live?'
		}); break;
		default: bot.reply(senderID, 'I don\'t have a brain yet.');
	}
});

bot.on('error', (err) => { console.error(err) });