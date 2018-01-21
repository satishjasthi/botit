const Schema = require('mongoose').Schema;
const userSchema = require('./preferences.mdl');

const chatSchema = new Schema({
	"sender": { "type": String, "ref": userSchema },
	"receiver": { "type": String, "ref": userSchema },
	"message": String,
	"timestamp": {
		"type": Date,
		"default": Date.now()
	}
});

const ChatModel = chatSchema;

/**
 * @description save chat between senderId and receiverId,
 * this will be referenced by senderId
 *
 * @param {String} senderId
 * @param {String} receiverId
 * @param {{}} chat
 * @returns {Promise|*|Promise<T>}
 */
function save (senderId, receiverId, chat) {
	const chat = new ChatModel({
		_id: senderId,
		sender: senderId,
		receiver: receiverId,
		message: chat
	});
	return chat.save(chat)
		.then(chat => chat)
		.catch(err => err);
}


/**
 * @description Retrieve chats from senderId to receiverID
 * @param {String} senderId
 * @param {String} receiverId
 * @param {Number} limit
 * @returns {Promise}
 */
function get (senderId, receiverId, limit = 10) {
	return ChatModel.find({
		sender: senderId,
		receiver: receiverId
	})
		.limit(limit)
		.then(chats => chats)
		.catch(err => err);
}

module.exports = {
	get,
	save
};