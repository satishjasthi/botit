module.exports = function (req, res) {
	if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === this.config.validationToken) {
		this.changeVerificationStatus(true);
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		this.changeVerificationStatus(false);
		this.emit('error', "Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
};