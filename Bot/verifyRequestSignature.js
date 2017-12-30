const crypto = require('crypto');

function verifyRequestSignature(req, res, buf) {
	const signature = req.headers["x-hub-signature"];
	if (!signature) {
		// For testing, let's log an error. In production, you should throw an
		// error.
		throw new Error("Couldn't validate the signature.");
	} else {
		const elements = signature.split('=');
		const method = elements[0];
		const signatureHash = elements[1];

		const expectedHash = crypto.createHmac('sha1', this.config.appSecret)
			.update(buf)
			.digest('hex');

		if (signatureHash !== expectedHash) {
			throw new Error("Couldn't validate the request signature.");
		}
	}
}

module.exports = verifyRequestSignature;