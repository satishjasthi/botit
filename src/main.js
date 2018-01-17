const bluebird = require('bluebird');
const Bot = require('../Bot');
// const config = require('../config/default.json');
const chatFlow = require('./router');
const nodeMap = require('./map/index');

const bot = new Bot({ chatFlow });


bot.on('server-started', ({ senderId = '1500', messageText = 'hey' }) => {
  console.log('===== test mode active =====');
  const { intent, entities } = { intent: 'greeting', entities: {} };
  bot.chat.go(senderId, nodeMap(intent))
    .then(node => {
      return node.message.compile({ id: senderId, entities })
    })
    .then(data => {
      console.log('bot.response', data);
    })
});

bot.on('text-message', ({ senderId, messageText }) => {
  const {intent, entities} = () => ({intent: 'init', entities: {}});
  const nodeName = nodeMap(intent);
});