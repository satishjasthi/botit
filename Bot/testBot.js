const BotMaker = require('./');
const config = require('../config/default.json');

const bot = new BotMaker(config);
bot.init();

bot.on('test-event', (data) => { console.log(data) });

bot.on('text-message', ({ senderID, messageText }) => {
	bot.reply(senderID, 'I don\'t have a brain yet.');
});

bot.on('error', (err) => { console.error(err) });