const MessageBuilder = require('../../MessageBuilder');

const Greeting = new MessageBuilder({
	type: 'text',
	templates: {
		'default': function () {
			return { 'text': [`${this.smallTalk}`] }
		}
	},
	data: {
		'id': '',
		'user': {},
		'smallTalk': 'Hello!',
		'entities': {}
	},
	methods: {
		populateGreetingTemplate (user) {
			this.user = user;
			const templateName = this.templateResolve();
			const message = this.templates[templateName]();
			console.log(message.text);
			message.text = this.$randomize(message.text);
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
		fetchUserIfNotFound (user) {
			if (!user) {
				return this.fetch.$http.get(
					`https://graph.facebook.com/v2.6/${this.id}?
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
	compile ({ id, entities, smallTalk }) {
		this.id = id;
		this.entities = entities;
		this.smallTalk = smallTalk;
		return this.fetch.$store.user.get(id)
			.then(this.fetchUserIfNotFound)
			.then(this.populateGreetingTemplate)
			.catch(err => {
				console.error(err);
			})
	},
	templateResolve () {
		return 'default';
	}
});

module.exports = Greeting;