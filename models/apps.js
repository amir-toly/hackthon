/**
 * Created by Mathias on 7/30/2017.
 */

var mongoose = require('mongoose');

module.exports = mongoose.model('Apps',{
    id: String,
    user_id: String,
    name: String,
    description: String
});