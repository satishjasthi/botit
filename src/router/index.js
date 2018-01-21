const message = require('../messages');

module.exports = {
  mode: 'strict',
  freeway: ['init', 'error', 'place-order', 'faq'],
  nodes: [{
    name: 'init',
    intent: 'OTHER',
    path: '',
    message: message.greeting,
    exitTo: ['browse']
  }, {
    name: 'browse',
    path: 'browse',
    intent: 'BROWSING',
    message: message.browse,
    exitTo: ['select']
  }, {
    name: 'place-order',
    path: 'order/place',
    intent: 'PLACE_ORDER',
    message: message.placeOrder
  }, {
    name: 'edit-order',
    path: 'order/edit',
    intent: 'EDIT_ORDER',
    message: message.editOrder
  }, {
    name: 'faq',
    path: 'faq',
    intent: 'FAQ',
    message: message.faq
  }, {
    name: 'error',
    path: 'error',
    intent: 'error',
    message: message.botIsSick,
  }]
};

