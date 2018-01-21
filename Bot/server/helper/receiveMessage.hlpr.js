/**
 * @description Bot instance emits events when a text-message, quick-reply,
 * attachment is found in a user's message.
 * A message sent by facebook's messenger contains the event which has the actual message.
 * @this Bot
 * @param event
 */
module.exports = function receivedMessage(event) {
	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfMessage = event.timestamp;
	const message = event.message;

	console.log(
		"Received message for user %d and page %d at %d with message:",
		senderID,
		recipientID,
		timeOfMessage
	);
	console.log(JSON.stringify(message));

	const messageId = message.mid;
	const metadata = message.metadata;

	/* You may get a text or attachment but not both */
	const messageText = message.text;
	const messageAttachments = message.attachments;
	const quickReply = message.quick_reply;

	/* Fire events as per the object sent over by the message */
	if (messageText) { this.emit('text-message', { senderID, messageText, metadata }); }
	if (quickReply) { this.emit('quick-reply-message', { senderID, quickReply, metadata });}
	if (messageAttachments) { this.emit('attachment-message', { senderID, messageAttachments, metadata }); }
};