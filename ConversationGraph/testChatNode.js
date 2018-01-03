const ChatGraph = require('./ChatGraph');

const chatGraph = new ChatGraph({
	mode: 'strict',
	nodes: [{
		name: 'init',
		path: '/',
		message: 'hey',
		exitTo: ['browse', 'select']
	}, {
		name: 'browse',
		path: 'browse/',
		message: 'see these things',
		exitTo: ['select'],
		beforeEnter: function (to, from, next) {
			if (from.name === 'init') {
				next('init');
			} else {
				next(false);
			}
		}
	}, {
		name: 'select',
		path: 'select/',
		message: 'see these things too'
	}]
});

console.log(chatGraph.active);
chatGraph.go('browse');
console.log(chatGraph.active);
