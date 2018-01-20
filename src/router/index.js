const bluebird = require('bluebird');
const ChatGraph = require('../../ConversationGraph/ChatGraph');
const GreetingDialog = require('../dialogs/greeting');
const BotIsSick = require('../dialogs/error');

const chat = new ChatGraph({
  mode: 'strict',
  freeway: ['init', 'error'],
  nodes: [{
    name: 'init',
    intent: 'OTHER',
    path: '',
    message: GreetingDialog,
    exitTo: ['browse', 'select']
  }, {
    name: 'browse',
    path: 'browse',
    intent: 'BROWSING',
    message: 'see these things',
    exitTo: ['select', 'error']
  }, {
    name: 'placeOrder',
    path: 'order/place',
    intent: 'PLACE_ORDER',
    message: 'see these things too'
  }, {
    name: 'editOrder',
    path: 'order/edit',
    intent: 'EDIT_ORDER',
    message: 'see'
  }, {
    name: 'faq',
    path: 'faq',
    intent: 'FAQ',
    message: 'see'
  }, {
    name: 'error',
    path: 'error',
    intent: 'error',
    message: BotIsSick,
  }]
});

module.exports = chat;

