module.exports = function (req, res) {
	const self = this;
	self.emit('test-event', self._isVerified);
	res.status(200).json({
		'message': 'event emitted'
	})
};