const mongoose = require('mongoose');
const bluebird = require('bluebird');
const ChatGraph = require('./ChatGraph');

mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.Promise = bluebird;


const chatGraph = new ChatGraph({
	mode: 'strict',
    userId: '1500',
	nodes: [{
		name: 'init',
		path: '/',
		message: 'hey',
		exitTo: ['browse', 'select']
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
}).then(chatGraph => {
    console.log(chatGraph.graph);
    console.log(chatGraph.active);
    // chatGraph.go('1500', 'browse');
// console.log(chatGraph.active);
// console.log(chatGraph.matchNodeWithQuery('/browse?item=12&age=5'));
});

