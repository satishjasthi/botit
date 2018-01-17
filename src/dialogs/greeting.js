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
      const message = this.templates[templateName]();
      message.text = this.$prepareRapids(message.text);
      return message;
    },
    saveUserToDB (res) {
	    return this.fetch.$store.user.save(res.data);
    },
    getUserData (user) {
	    this.user = user;
	    return user;
    },
    errorHandler (err) {
	    console.error(err);
	    return null;
    },
    fetchUserIfNotFound (id, user) {
	    if (!user) {
		    return this.fetch.$http.get(
			    `https://graph.facebook.com/v2.6/${id}?
		        fields=first_name,last_name,profile_pic&
		        access_token=${this._config.pageAccessToken}`
		    )
			    .then(this.saveUserToDB)
			    .then(this.getUserData)
			    .catch(this.errorHandler)
	    } else {
		    return user;
	    }
    }
  },
  compile ({ id }) {
    return this.fetch.$store.user.get(id)
      .then(this.fetchUserIfNotFound.bind(this, id))
      .then(this.greetingTemplate)
      .catch(err => {
        console.error(err);
      })
  },
  templateResolve () {
    return (this.user) ? 'default' : 'noFirstName';
  }
});

module.exports = Greeting;