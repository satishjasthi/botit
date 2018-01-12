const mongoose = require('mongoose');
const bluebird = require('bluebird');

mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.Promise = bluebird;

const Cat = mongoose.model('Cat', { name: String });

const kitty = new Cat({ name: 'cat' });

kitty.save(function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log('meow');
	}
});