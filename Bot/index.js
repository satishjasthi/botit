const EventEmitter = require('events');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const _ = require('lodash');
const verifyRequestSignature = require('./verifyRequestSignature');
const listenServer = require('./server/helper');
const apiHandler = require('./server/apiHandlers/index');
const sendMessage = require('./server/helper/sendMessage');
const dataFetcher = require('../Data');

mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.Promise = bluebird;


class Bot extends EventEmitter {
	
	constructor ({ config, chatFlow }) {
		super();
		this.config = config;
		this.name = 'James Bot';
		this.chat = null;
		this._isVerified = false;
		this.fetch = dataFetcher;
		this.app = express();
		this._init(chatFlow);
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

	reply (recipientId, message) {
		const textMessages = message.text.slice(0, -1) || [];
		const lastText = message.text.slice(-1);
		for (let textMessage of textMessages) {
			sendMessage.call(this, recipientId, {
				'text': textMessage
			});
		}
		sendMessage.call(this, recipientId, {
			...message,
			text: lastText
		});
	}
	
	_init (chatFlow) {
	  const self = this;
		self._setupServer();
		self._verify();
		self._testRoute();
		self._receiveMessages();
		self.chat = chatFlow;
    self.emit('chat-loaded', self);
	}

}

module.exports = Bot;