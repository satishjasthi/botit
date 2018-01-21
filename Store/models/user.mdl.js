const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	"_id": String,
	"first_name": String,
	"last_name": String,
	"profile_pic": String,
	"locale": String,
	"timezone": Number,
	"gender": String,
	"last_ad_referral": {
		"source": String,
		"type": String,
		"ad_id": String
	}
});

const UserModel = mongoose.model('User', userSchema);

/**
 * @description save user data to database
 * this should strictly be profile relevant data.
 *
 * @param {{}} userData
 * @returns {Promise|*|Promise<T>}
 */
function save(userData) {
	const user = new UserModel({ ...userData, _id: userData.id });
	return user.save()
		.then(user => user)
		.catch(err => err);
}


/**
 * @description Fetch profile data for a user with user-id = userId
 * @param {String} userId
 * @returns {Promise|*|Promise<T>}
 */
function get (userId) {
	return UserModel.findById(userId)
		.then(user => user)
		.catch(err => err);
}

module.exports = {
	get,
	save
};