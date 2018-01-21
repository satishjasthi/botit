const EventEmitter = require('events');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const querystring = require('querystring');
const verifyRequestSignature = require('./verifyRequestSignature');
const listenServer = require('./server/helper');
const apiHandler = require('./server/apiHandlers/index');
const ChatGraph = require('../ChatGraph/ChatGraph');


mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.Promise = bluebird;


class Bot extends EventEmitter {

	/**
	 * @description Creates a bot instance
	 * @param {{}} config - Application config, contains info about credentials to connect
	 * with the platform on which the bot is to be linked.
	 *
	 * @param {{}} chatFlow - Each bot must have a chat-flow
	 * which can be passed into the ChatGraph class
	 *
	 * @param {{}} apiConf - $http uses axios, apiConf is the
	 * default configuration needed to be set on axios.
	 *
	 * @param {function} dataFetch - Function which returns an object with
	 * properties:
	 * $http: Uses Axios
	 * $store: Wraps user's Mongoose models with functional interface.
	 */
	constructor ({ config, chatFlow, apiConf, dataFetch }) {
		super();
		this.config = config;
		this.name = 'James Bot';
		this.chat = null;
		this.fetch = dataFetch(apiConf);
		this.app = express();
		this._init(chatFlow);
	}

	/**
	 * @description Setup an express server
	 * @private
	 */
	_setupServer () {
		const self = this;
		self.app.set('port', process.env.PORT || 5000);
		self.app.use(bodyParser.json({ verify: verifyRequestSignature.bind(self) }));
		self.app.listen(self.app.get('port'), 'localhost', listenServer.bind(self));
	}

	/**
	 * @description Adds a verification route.
	 * @private
	 */
	_verify () {
		const self = this;
		self.app.get('/', apiHandler.verifyWebhook.bind(self));
	}

	/**
	 * @description Adds a route to receive messages.
	 * @private
	 */
	_receiveMessages () {
		const self = this;
		self.app.post('/', apiHandler.messageReceiver.bind(self));
	}


	/**
	 * @description Messenger bots receive messages when a POST request
	 * is made to the following url. https://graph.facebook.com/v2.6/me/messages
	 * page access token must be provided as a querystring. Along with the message
	 * data to be sent in the format: {
	 *  recipient: {
	 *    id
	 *  },
	 *  message: message<object>
	 * }
	 *
	 * @param {string} id
	 * @param {{}} message
	 * @returns {Promise|Promise.<T>}
	 * @private
	 */
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


	/**
	 * @description The method to send messages from the bot
	 * As a cosmetic feature, the bot is able to send messages in multiple parts
	 * to simulate a human way of typing.
	 *
	 * Therefore each part is collected in an array of promises: fns
	 * with arguments bound to the _sendMessageViaBot method
	 *
	 * In case of a message containing quick-replies or attachments,
	 * they will be sent with the last message to maintain consistency.
	 * this is why the lastText variable is maintained.
	 *
	 * finally bluebird.mapSeries ensures that the
	 * messages are sent in their sequence. Otherwise promises resolve
	 * in parallel leading to messed up message order.
	 *
	 * TODO: Disable rapids: user should pass an argument to disable multipart messaging.
	 *
	 * @param {string} recipientId
	 * @param {{}} message
	 * @param {[string]} message.text
	 */
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

	/**
	 * @description Initialize the bot:
	 * 1. Setup server
	 * 2. Set verification route.
	 * 3. Set message receiver route.
	 * 4. Setup a ChatGraph instance.
	 * @param chatFlow
	 * @private
	 */
	_init (chatFlow) {
		this._setupServer();
		this._verify();
		this._receiveMessages();
		this.chat = new ChatGraph(chatFlow);
	}

}

module.exports = Bot;