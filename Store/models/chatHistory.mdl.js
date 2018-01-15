const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = require('./user.mdl');

const historySchema = new Schema({
	"_user": { "type": String, "ref": userSchema },
	"history": [{
		"name": String,
		"path": String,
		"params":  {
		    "type": "Object",
            "default": {}
        }
	}],
    "strict": Boolean
});

historySchema.statics.active = function activeRoute (userId) {
    return this.model('UserHistory').aggregate([
        {
            $match: {
                '_user': userId
            }
        },
        {
            $project: {
                active: {
                    $arrayElemAt: [ "$history", -1 ]
                }
            }
        }
    ])
};

historySchema.statics.push = function updateHistory (userId, history) {
    return this.model('UserHistory').update(
        {"_user": userId },
        { "$push": { "history": history }},
        { "new": true, "upsert": true }
     )
};

module.exports = mongoose.model('UserHistory', historySchema);