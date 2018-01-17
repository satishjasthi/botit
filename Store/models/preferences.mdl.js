const Schema = require('mongoose').Schema;
const userSchema = require('./preferences.mdl');

const userPreferenceSchema = new Schema({
	"_id": { "type": String, "ref": userSchema },
	"preference": [{
		"name": String,
		"meta": Object,
		"description": String,
		"imageUrl": String
	}]
});

module.exports = userPreferenceSchema;