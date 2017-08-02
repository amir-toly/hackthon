var mongoose = require('mongoose');
var request = require('request').defaults({
    //proxy: '',
    timeout: 60000
});

var Mop = mongoose.model('Mop');

module.exports = {

    handleCallback: function(req, res) {
        var code = req.query.code;
        var state = req.query.state;
        console.log('code:' + code + ' state:' + state)

        getAccessToken(code, function(err, body) {
            console.log(body);
//            Mop.create({}, function(err, mop){
//
//            });
        });

        function getAccessToken(code, callback) {

            var form = {grant_type: 'authorization_code', code: code};

            var options = {
                uri: 'https://sandbox.api.macquariebank.io/connect/v1/oauth2/token',
                headers : {
                    'client_id': '',
                    'client_secret': '',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                form: {grant_type: 'authorization_code', code: code},
                json: true
            };

            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                    return callback(null, body);
                } else {
                    console.log(error);
                    console.log(response);
                    return callback(error, null)
                }

            })
        }
    }


}
