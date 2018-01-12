const Schema = require('mongoose').Schema;
const userSchema = require('./preferences.mdl');

const userPreferenceSchema = new Schema({
	"_user": { "type": Schema.ObjectId, "ref": userSchema },
	"preference": [{
		"name": String,
		"price": Number,
		"description": String,
		"imageUrl": String
	}]
})

module.exports = userPreferenceSchema;