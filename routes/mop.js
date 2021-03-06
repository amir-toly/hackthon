var mongoose = require('mongoose');
var request = require('request').defaults({
    //proxy: '',
    timeout: 60000
});

var MQT = require('./mqt');
var Applications = mongoose.model('Applications');

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;

module.exports = {

    handleCallback: function(req, res) {
        var code = req.query.code;
        var state = req.query.state;
        console.log('code:' + code + ' state:' + state)

//        var msg = '{   "accounts": [{     "name": "ABC",     "balance": "1035",     "last": "10 $ at toto"       },   {     "name": "acct 2",     "balance": "102",     "last": "24 $ at pizza"       }   ] }';
//        MQT.startAndPush('/accounts/AE3F5', msg);

        getAccessToken(code, function(err, body) {
            console.log(body);
            Applications.findOneAndUpdate({ app_key: state },
                        {$set: { access_token: body.access_token,
                                 refresh_token: body.refresh_token}}, function(err, app){
                            console.log('app refresh_token:' + app.refresh_token);
                            getAccounts(app.access_token, function(err, body) {

                                //MQT.startAndPush(JSON.stringify(body));
                                console.log('accounts are: ' + body)

                                Applications.findOneAndUpdate({ app_key: state },
                                                {$set: {accounts: body}},
                                            function(err, app){
                                                if(err) res.render('error', { error: 'Error updating Application'});
                                                console.log('Updated application is:' + app);
                                                Applications.findOne({ 'app_key': state }, '_id', function (err, app) {
                                                          if (err) {
                                                            console.log('err:' + err);
                                                            redirect('/error');
                                                          }
                                                          res.redirect('/application/'+app._id);
                                                        });
                                        });
                            });

            });
        });

        function getAccessToken(code, callback) {

            var options = {
                uri: 'https://sandbox.api.macquariebank.io/connect/v1/oauth2/token',
                headers : {
                    'client_id': client_id,
                    'client_secret': client_secret,
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
                    console.log(body);
                    return callback(error, null)
                }

            })
        }


        function getAccounts(access_token, callback) {

            var options = {
                uri: 'https://sandbox.api.macquariebank.io/connect/v1/accounts',
                headers : {
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'Authorization': 'Bearer ' + access_token
                },
                method: 'GET',
                json: true
            };

            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                    return callback(null, body);
                } else {
                    console.log(error);
                    console.log(body);
                    return callback(error, null)
                }

            })
        }
    }


}
