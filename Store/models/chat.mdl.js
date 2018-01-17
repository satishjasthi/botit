const Schema = require('mongoose').Schema;
const userSchema = require('./preferences.mdl');

const chatSchema = new Schema({
	"sender": { "type": String, "ref": userSchema },
	"receiver": { "type": String, "ref": userSchema },
	"message": String,
	"timestamp": {
		"type": Date,
		"default": Date.now()
	}
});

module.exports = chatSchema;