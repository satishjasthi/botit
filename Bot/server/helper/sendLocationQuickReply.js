const fbSend = require('./fbSend');

module.exports = function sendLocationQuickReply(recipientId, { promptText }) {
	const messageData = {
		recipient: { id: recipientId },
		message: { text: promptText, quick_replies: [{ "content_type": "location" }] }
	};

	fbSend.call(this, messageData);
};