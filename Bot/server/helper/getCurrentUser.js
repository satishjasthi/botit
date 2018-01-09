const request = require('request');

function getCurrentUser (userId, pageAccessToken) {
	if (!userId) return null;
	const url = `https://graph.facebook.com/v2.6/${userId}?
	fields=first_name,last_name,profile_pic,timezone,gender&access_token=${pageAccessToken}`;
	return new Promise((resolve, reject) => {
		request({ url }, (err, response, body) => {
			if (err) {
				reject(err);
			} else {
				resolve(body);
			}
		});
	});
}

module.exports = getCurrentUser;