/**
 * @description Facebook verifies messenger apps with a challenge issued against
 * a submitted verification token. If the token submitted to facebook matches here,
 * the endpoint will return the hub.challenge back to complete the verification.
 *
 * @this Bot
 * @param req
 * @param res
 */
module.exports = function (req, res) {
	if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === this.config.validationToken) {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		this.emit('error', "Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
};