const fbSend = require('./fbSend');

module.exports = function sendMessage(recipientId, message) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: message
	};
	fbSend.call(this, messageData);
};