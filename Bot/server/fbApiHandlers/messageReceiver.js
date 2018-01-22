/** @type function */
const receivedMessage = require('../helper/receiveMessage.hlpr');

/**
 * @description Check incoming request for messages
 * You must send back a 200, within 20 seconds, to let facebook know you've
 * successfully received the callback. Otherwise, the request will time out.
 * @this Bot
 * @param req
 * @param res
 */
module.exports = function (req, res) {
	const data = req.body;
	// Make sure this is a page subscription
	if (data.object === 'page') {
		// Iterate over each entry
		// There may be multiple entries if batched
		data.entry.forEach(checkPageEntryForMessage.bind(this));
		res.sendStatus(200);
	}
};

/**
 * @description Iterate over each messaging event, only the subscribed events would be found.
 * @this Bot
 * @param pageEntry
 * @param {Array} pageEntry.messaging
 */
function checkPageEntryForMessage (pageEntry) {
	if (Array.isArray(pageEntry.messaging)) {
		pageEntry.messaging.forEach(checkMessagingEvent.bind(this));
	}
}

/**
 * @description A messenger bot can subscribe to various events.
 * If any of the subscribed events is emitted by the facebook webhook,
 * it should be received here.
 * @param {{}} messagingEvent
 */
function checkMessagingEvent (messagingEvent) {
	if (messagingEvent.optin) {
		// receivedAuthentication(messagingEvent);
	} else if (messagingEvent.message) {
		receivedMessage.call(this, messagingEvent);
	} else if (messagingEvent.delivery) {
		// receivedDeliveryConfirmation(messagingEvent);
	} else if (messagingEvent.postback) {
		// receivedPostback(messagingEvent);
	} else if (messagingEvent.read) {
		// receivedMessageRead(messagingEvent);
	} else if (messagingEvent.account_linking) {
		// receivedAccountLink(messagingEvent);
	} else {
		this.emit('error', `Webhook received unknown messagingEvent: ${messagingEvent}`);
		console.log("Webhook received unknown messagingEvent: ", messagingEvent);
	}
}