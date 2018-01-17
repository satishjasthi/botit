module.exports = function receivedMessage(event) {
	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfMessage = event.timestamp;
	const message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	const messageId = message.mid;
	const metadata = message.metadata;

	// You may get a text or attachment but not both
	const messageText = message.text;
	const messageAttachments = message.attachments;
	const quickReply = message.quick_reply;
	this.emit('text-message', { senderID, messageText, metadata });
	// sendTextMessage.call(this, senderID, messageText);
};