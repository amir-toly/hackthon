/**
 * Created by Mathias on 7/30/2017.
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var mopSchema = new Schema({
    user_id: String,
    name: String,
    refresh_token: String,
    access_token: String,
    accounts: [],
    transactions: []
});
module.exports = mongoose.model('Mop', mopSchema);