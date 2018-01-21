const userModelFns = require('./models/user.mdl');
const chatModelFns = require('./models/chat.mdl');
const preferenceModelFns = require('./models/preferences.mdl');


module.exports = {
  user: userModelFns,
  chat: chatModelFns,
  preference: preferenceModelFns
};