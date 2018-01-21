const EventEmitter = require('events');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const querystring = require('querystring');
const verifyRequestSignature = require('./verifyRequestSignature');
const listenServer = require('./server/helper');
const apiHandler = require('./server/apiHandlers/index');
const ChatGraph = require('../ConversationGraph/ChatGraph');
const dataFetcher = require('../Data');

mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.Promise = bluebird;


class Bot extends EventEmitter {
	
	constructor ({ config, chatFlow, apiConf }) {
		super();
		this.config = config;
		this.name = 'James Bot';
		this.chat = null;
		this._isVerified = false;
		this.fetch = dataFetcher(apiConf);
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

	_sendMessageViaBot (id, message) {
		return this.fetch.$http.post(
			'https://graph.facebook.com/v2.6/me/messages?' +
			querystring.stringify({ access_token: this.config.pageAccessToken }),
			{ recipient: { id }, message: message }
		).then(res => {
			return bluebird.resolve(res.data);
		}).catch(err => {
			console.error(err);
			return bluebird.reject(err);
		})
	}

	reply (recipientId, message) {
		const textMessages = message.text.slice(0, -1) || [];
		const lastText = message.text.slice(-1)[0] || '...';

		const fns = textMessages.map(textMessage => {
			return this._sendMessageViaBot.bind(this, recipientId, { 'text': textMessage });
		});

		fns.push(this._sendMessageViaBot.bind(this, recipientId, { ...message, text: lastText }));
		bluebird.mapSeries(fns, function (fn) {
			return fn();
		})
	}
	
	_init (chatFlow) {
		this._setupServer();
		this._verify();
		this._testRoute();
		this._receiveMessages();
		this.chat = new ChatGraph(chatFlow);
	}

}

module.exports = Bot;