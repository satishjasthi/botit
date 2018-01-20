module.exports = {
	type: 'text',
	templates: {
		'default': function () {
			return { 'text': [`Edit order for your ${JSON.stringify(this.entities)}?`] }
		}
	},
	data: {
		'id': '',
		'user': {},
		'smallTalk': 'Hello!',
		'entities': {}
	},
	methods: {
		populateGreetingTemplate () {
			const templateName = this.templateResolve();
			const message = this.templates[templateName]();
			console.log(message.text);
			message.text = this.$randomize(message.text);
			return message;
		}
	},
	compile ({ id, entities, smallTalk }) {
		this.id = id;
		this.entities = entities;
		this.smallTalk = smallTalk;
		return this.populateGreetingTemplate();
	},
	templateResolve () {
		return 'default';
	}
};