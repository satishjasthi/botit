const Schema = require('mongoose').Schema;
const userSchema = require('./preferences.mdl');

const chatSchema = new Schema({
	"_user": { "type": Schema.ObjectId, "ref": userSchema },
	"history": [{
		"route": String,
		"params": String,
		"timestamp": {
			"type": Date,
				"default": Date.now()
			}
	}]
});

module.exports = chatSchema;