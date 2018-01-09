const QuickReplyTypeError = require('./Errors').QuickReplyTypeError;
const QuickReplyFormatError = require('./Errors').QuickReplyFormatError;

/**
 * Response builder for general quick-replies.
 * @param {string} title
 * @param {string} payload
 * @param {string} imageUrl
 * @returns {{content_type: string, title: string, payload: string, image_url?:L string}}
 */
function textQR ({ title, payload, imageUrl }) {
	const quickReply = { "content_type": "text", "title": title, "payload": payload };
	if (typeof imageUrl === 'string' && imageUrl.length > 5) {
		quickReply['image_url'] = imageUrl;
	}
	return quickReply;
}

/**
 * Response builder for location seeking quick-replies.
 * @returns {{content_type: string}}
 */
function locationQR () {
	return { "content_type": "location" }
}

module.exports = {
	textQR,
	locationQR
};