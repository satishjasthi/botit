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

const PreferenceModel = userPreferenceSchema;

/**
 * @description save user's preferences against userId.
 * This method should be used to save non-profile data.
 *
 * @param userId
 * @param preference
 * @returns {Promise|*|Promise<T>}
 */
function save (userId, preference) {
	const preference = new PreferenceModel({
		_id: userId,
		preference
	});
	return preference.save()
		.then(preference => preference)
		.catch(err => err);
}


/**
 * @description Get preferences of user with id = userId
 * @param userId
 * @returns {Promise}
 */
function get (userId) {
	return PreferenceModel.findById(userId)
		.then(preference => preference)
		.catch(err => err);
}

module.exports = {
	get,
	save
};