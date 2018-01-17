const bluebird = require('bluebird');
const UserModel = require('./models/user.mdl');
const ChatModel = require('./models/chat.mdl');
const PreferenceModel = require('./models/preferences.mdl');


/**
 * @description If a promise is resolved, return the resolved value
 * for chaining .then
 *
 * @param data
 * @private
 */
function _resolve (data) {
  return bluebird.resolve(data);
}

/**
 * @description If a promise is rejected, return the rejected error
 * to capture in .catch
 *
 * @param err
 * @private
 */
function _reject (err) {
  return bluebird.reject(err);
}


/**
 * @description save user data to database
 * this should strictly be profile relevant data.
 *
 * @param {{}} userData
 * @returns {Promise|*|Promise<T>}
 */
function saveUser (userData) {
  const user = new UserModel({ ...userData, _id: userData.id });
  console.log('schema view', user);
  return user.save()
    .then(_resolve)
    .catch(_reject);
}


/**
 * @description Fetch profile data for a user with user-id = userId
 * @param {String} userId
 * @returns {Promise|*|Promise<T>}
 */
function getUser (userId) {
  return UserModel.findById(userId)
    .then(_resolve)
    .catch(_reject);
}


/**
 * @description save chat between senderId and receiverId,
 * this will be referenced by senderId
 * 
 * @param {String} senderId
 * @param {String} receiverId
 * @param {{}} chat
 * @returns {Promise|*|Promise<T>}
 */
function saveChat (senderId, receiverId, chat) {
  const chat = new ChatModel({
    _id: senderId,
    sender: senderId,
    receiver: receiverId,
    message: chat
  });
  return chat.save(chat)
    .then(_resolve)
    .catch(_reject);
}


/**
 * @description Retrieve chats from senderId to receiverID
 * @param {String} senderId
 * @param {String} receiverId
 * @param {Number} limit
 * @returns {Promise}
 */
function getChat (senderId, receiverId, limit = 10) {
  return ChatModel.find({
    sender: senderId,
    receiver: receiverId
  })
    .limit(limit)
    .then(_resolve)
    .catch(_reject);
}

/**
 * @description save user's preferences against userId.
 * This method should be used to save non-profile data.
 *
 * @param userId
 * @param preference
 * @returns {Promise|*|Promise<T>}
 */
function savePreferences (userId, preference) {
  const preference = new PreferenceModel(preference);
  return preference.save()
    .then(_resolve)
    .catch(_reject);
}


/**
 * @description Get preferences of user with id = userId
 * @param userId
 * @returns {Promise}
 */
function getPreferences (userId) {
  return PreferenceModel.findById(userId)
    .then(_resolve)
    .catch(_reject);
}

module.exports = {
  user: { get: getUser, save: saveUser },
  chat: { get: getChat, save: saveChat },
  preference: { get: getPreferences, save: savePreferences}
};