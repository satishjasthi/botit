const MessageBuilder = require('../../MessageBuilder');

const Greeting = new MessageBuilder({
  type: 'text',
  templates: {
    'default': function () {
      return {
        'text': `Nice to meet you. ${ this.user.first_name } ${ this.user.last_name }`
      }
    },
    'noFirstName': function () {
      return {
        'text': 'Hello there...'
      }
    },
    'noLastName': function () {
      return {
        'text': `Nice to meet you ${ this.user.first_name }`
      }
    }
  },
  data: {
    'user': {}
  },
  methods: {
    greetingTemplate (user) {
      this.user = user;
      const templateName = this.templateResolve();
      const message = this.templates[templateName]();
      message.text = this.$prepareRapids(message.text);
      return message;
    }
  },
  compile ({ id }) {
    const self = this;
    return self.fetch.$store.user.get(id)
      .then(user => {
        if (!user) {
          console.log('get profile for user', id, 'page token', this._config.pageAccessToken);
	        return self.fetch.$http.get(
		        `https://graph.facebook.com/v2.6/${id}?fields=first_name,last_name,profile_pic&access_token=${this._config.pageAccessToken}`
	        ).then(res => {
	          console.log(res.data);
	          return self.fetch.$store.user.save(res.data);
          }).then(user => {
            self.user = user;
            return user;
          }).catch(err => {
            return null;
          })
        } else {
          return user;
        }
      })
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