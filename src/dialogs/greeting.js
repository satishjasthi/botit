const bluebird = require('bluebird');
const MessageBuilder = require('../../MessageBuilder');

const Greeting = new MessageBuilder({
  type: 'text',
  templates: {
    'default': 'Nice to meet you {{ user.firstName }} {{ user.lastName }}',
    'noFirstName': 'Hello there...',
    'noLastName': 'Nice to meet you {{ firstName }}'
  },
  deps: {
    'user': {}
  },
  methods: {
    getUserData (id) {
      return userProfileMock(id);
    }
  },
  collect () {
    return bluebird.all([this.getUserData()])
  },
  build () {
    return (this.user) ? 'default' : 'noFirstName';
  }
});

function userProfileMock (id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        'firstName': 'Bob',
        'lastName': 'Ross'
      })
    }, 1000)
  })
}

module.exports = Greeting;