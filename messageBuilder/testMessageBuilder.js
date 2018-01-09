const MessageBuilder = require('./');

const HelloWorld = new MessageBuilder({
	type: 'text',
	templates: {
		'default': 'Oh well, {{ helloWorld }}. {{ something }}, {{somethingMore}}',
		'fallback_0': 'uh oh',
		'fallback_1': '{{uhOh }}'
	},
	data () {
		return {
			helloWorld: 'Hello World!',
			uhOh: 'uh oh!'
		}
	},
	deps: {
		something: {
			'default': 'wasn\'t that hard'
		},
		somethingMore: 'was it?'
	},
	build () {
		return (!this.helloWorld) ? 'fallback_0' : 'default';
	}
});

console.log(HelloWorld);
console.log(HelloWorld.exec());