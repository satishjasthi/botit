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

module.exports = mongoose.model('User', userSchema);