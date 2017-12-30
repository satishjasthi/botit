const fbSend = require('./fbSend');

module.exports = function sendQuickReply(recipientId, { promptText, quickReplies }) {
	const quickReplyContentTypeAdded = quickReplies.map(el => {
		return { ...el, content_type: "text" }
	});
	const messageData = {
		recipient: { id: recipientId },
		message: { text: promptText, quick_replies: quickReplyContentTypeAdded }
	};

	fbSend.call(this, messageData);
};