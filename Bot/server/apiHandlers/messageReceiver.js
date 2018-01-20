const receivedMessage = require('../helper/receiveMessage.hlpr');

module.exports = function (req, res) {
	const data = req.body;
	const self = this;
	// Make sure this is a page subscription
	if (data.object === 'page') {
		// Iterate over each entry
		// There may be multiple if batched
		data.entry.forEach(function(pageEntry) {
			const pageID = pageEntry.id;
			const timeOfEvent = pageEntry.time;

			if (Array.isArray(pageEntry.messaging)) {

				// Iterate over each messaging event
				pageEntry.messaging.forEach(function(messagingEvent) {
					if (messagingEvent.optin) {
						// receivedAuthentication(messagingEvent);
					} else if (messagingEvent.message) {
						receivedMessage.call(self, messagingEvent);
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
				});

			}

		});

		// Assume all went well.
		//
		// You must send back a 200, within 20 seconds, to let us know you've
		// successfully received the callback. Otherwise, the request will time out.
		res.sendStatus(200);
	}
};