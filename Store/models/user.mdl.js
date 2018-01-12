const Schema = require('mongoose').Schema;

const userSchema = new Schema({
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
})

module.exports = userSchema;