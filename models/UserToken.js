/**
 * Created by Mathias on 7/30/2017.
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var userTokenSchema = new Schema({
    user_id: String,
    name: String,
    refresh_token: String,
    access_token: String
});
module.exports = mongoose.model('UserToken', userTokenSchema);