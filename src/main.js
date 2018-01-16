const bluebird = require('bluebird');
const Bot = require('../Bot');
// const config = require('../config/default.json');
const chatFlow = require('./router');
const nodeMap = require('./map/index');

const bot = new Bot();

bot.init(chatFlow);

bot.on('chat-loaded', ({ senderId = '1500', messageText = 'hey' }) => {
  console.log('===== test mode active =====');
  const { intent, entities } = {intent: 'greeting', entities: {}};
  const nodeName = nodeMap(intent);
  bot.chat.go(senderId, nodeName)
    .then(node => {
      return node.message.getUserData(senderId)
        .then(user => {
          node.message.user = user;
          return node.message;
        })
    })
    .then(message => {
      console.log(message.exec());
    })
});

bot.on('text-message', ({ senderId, messageText }) => {
  const {intent, entities} = () => ({intent: 'init', entities: {}});
  const nodeName = nodeMap(intent);
});