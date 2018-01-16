const Schema = require('mongoose').Schema;
const userSchema = require('./preferences.mdl');

const chatSchema = new Schema({
	"sender": { "type": Schema.ObjectId, "ref": userSchema },
	"receiver": { "type": Schema.ObjectId, "ref": userSchema },
	"message": String,
	"timestamp": {
		"type": Date,
		"default": Date.now()
	}
});

module.exports = chatSchema;