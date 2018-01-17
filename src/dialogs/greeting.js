const MessageBuilder = require('../../MessageBuilder');

const Greeting = new MessageBuilder({
  type: 'text',
  templates: {
    'default': function () {
      return {
        'text': `Nice to meet you. ${ this.user.first_name } ${ this.user.last_name }`,
        'quick_replies': []
      }
    },
    'noFirstName': function () {
      return 'Hello there...'
    },
    'noLastName': function () {
      return `Nice to meet you ${ this.user.first_name }`
    }
  },
  data: {
    'user': {}
  },
  methods: {
    greetingTemplate (user) {
      this.user = user;
      const templateName = this.templateResolve();
      return this.templates[templateName].call(this);
    }
  },
  compile ({ id }) {
    const self = this;
    return self.fetch.$store.user.get(id)
      .then(self.greetingTemplate)
      .catch(err => {
        console.error(err);
      })
  },
  templateResolve () {
    return (this.user) ? 'default' : 'noFirstName';
  }
});

module.exports = Greeting;