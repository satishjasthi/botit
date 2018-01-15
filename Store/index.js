const mongoose = require('mongoose');
const bluebird = require('bluebird');
const HistoryModel = require('./models/chatHistory.mdl');
const UserModel = require('./models/user.mdl');

mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
mongoose.Promise = bluebird;

/**
 // user = new UserModel({
//     "_id": "1500",
//     "first_name": "dude",
//     "last_name": "lord",
//     "profile_pic": "",
//     "locale": "en_US",
//     "timezone": 5.5,
//     "gender": "male",
// });
 //
 // user.save().then(data => {
//     console.log(data);
// }).catch(err => {
//     console.error(err);
// });
 */

// history = new HistoryModel({
//     "_user": "1500",
//     "history": [{
//         "name": "select",
//         "path": "select"
//     }]
// });

// history.save()
//     .then(data => {
//         console.log(data);
//     })
//     .catch(err => {
//         console.error(err);
//     });

// HistoryModel.push ("1500", {
//     "name": "browse",
//     "path": "browse"
// }).then(data => {
//     console.log(data);
// }).catch(err => {
//     console.error(err);
// });


HistoryModel.active("100")
    .then(data => {
        console.log(JSON.stringify(data))
    }).catch(err => {
        console.error(err)
    });