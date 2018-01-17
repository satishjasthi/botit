const bluebird = require('bluebird');
const ChatGraph = require('../../ConversationGraph/ChatGraph');
const GreetingDialog = require('../dialogs/greeting');

const chat = new ChatGraph({
  mode: 'strict',
  nodes: [{
    name: 'init',
    path: '/',
    message: GreetingDialog,
    exitTo: ['browse', 'select'],
    beforeExit: function (from, to) {
      return new bluebird((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 1000)
      })
    }
  }, {
    name: 'browse',
    path: 'browse',
    message: 'see these things',
    exitTo: ['select']
  }, {
    name: 'select',
    path: 'select',
    message: 'see these things too'
  }]
});

module.exports = chat;

