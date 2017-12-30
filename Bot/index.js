const EventEmitter = require('events');
const express = require('express');
const bodyParser = require('body-parser');
const verifyRequestSignature = require('./verifyRequestSignature');
const listenServer = require('./server/helper');
const apiHandler = require('./server/apiHandlers/index');
const sendTextMessage = require('./server/helper/sendTextMessage');

class Bot extends EventEmitter {
	
	constructor (config) {
		super();
		this.config = config;
		this._isVerified = false;
		this.app = express();
	}

	_setupServer () {
		const self = this;
		self.app.set('port', process.env.PORT || 5000);
		self.app.use(bodyParser.json({ verify: verifyRequestSignature.bind(self) }));
		self.app.listen(self.app.get('port'), 'localhost', listenServer.bind(self));
	}

	_verify () {
		const self = this;
		self.app.get('/', apiHandler.verifyWebhook.bind(self));
	}

	_testRoute () {
		const self = this;
		self.app.get('/test', apiHandler.testEndpoint.bind(self));
	}

	_receiveMessages () {
		const self = this;
		self.app.post('/', apiHandler.messageReceiver.bind(self));
	}

	changeVerificationStatus (state) {
		this._isVerified = state
	}

	reply (recipientId, messageText) {
		sendTextMessage.call(this, recipientId, messageText);
	}

	init () {
		this._setupServer();
		this._verify();
		this._testRoute();
		this._receiveMessages();
	}

}

module.exports = Bot;