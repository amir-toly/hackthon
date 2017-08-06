var mongoose = require('mongoose');
var request = require('request').defaults({
    //proxy: '',
    timeout: 60000
});

var MQT = require('./mqt');
var Mop = mongoose.model('Mop');

var client_id = '';
var client_secret = '';

module.exports = {

    handleRefresh: function(req, res) {
        var app_key = req.query.appkey;
        console.log('app_key:' + app_key)
        var refresh_token;

        Mop.findOne({ 'app_key': app_key }, 'app_key, refresh_token', function (err, mop) {
          if (err) {
            console.log('err:' + err);
            redirect('/error');
          };
          console.log('Mop is:' + mop)
          refresh_token = mop.refresh_token;

          getNewAccessToken(refresh_token, function(err, body) {
              console.log('getNewAccessToken err:' + err);
              console.log('getNewAccessToken body:' + body);
              Mop.findOneAndUpdate({app_key: app_key},
                          { $set: {access_token: body.access_token,
                          refresh_token: body.refresh_token}}, function(err, mop){

                              getAccounts(mop.access_token, function(err, body) {

                                  for(var i = 0; i < body.accounts.length; i++) {
                                      var obj = body.accounts[i];

                                      console.log(obj.account_id);

                                    getBalances(obj.account_id, mop.access_token, function(err, body) {

                                        MQT.startAndPush("/topic/balances", JSON.stringify(body));

                                        Mop.findOneAndUpdate({ app_key: app_key },
                                                        {$set: {balances: body}},
                                                    function(err, mop){
                                                        if(err) res.render('error', { error: 'Error updating Mop'});
                                                });
                                    });

                                    getTransactions(obj.account_id, mop.access_token, function(err, body) {

                                        MQT.startAndPush("/topic/transactions", JSON.stringify(body));

                                        Mop.findOneAndUpdate({ app_key: app_key },
                                                        {$set: {transactions: body}},
                                                    function(err, mop){
                                                        if(err) res.render('error', { error: 'Error updating Mop'});
                                                });
                                    });

                                  }

                                  MQT.startAndPush("/topic/accounts", JSON.stringify(body));
                                  console.log('accounts are: ' + body)

                                  Mop.findOneAndUpdate({ app_key: app_key },
                                                  {$set: {accounts: body}},
                                              function(err, mop){
                                                  if(err) res.render('error', { error: 'Error updating Mop'});
                                                res.send(200);
                                          });
                              });



              });
          });

        })



        function getNewAccessToken(refresh_token, callback) {
            console.log(refresh_token)
            var options = {
                uri: 'https://sandbox.api.macquariebank.io/connect/v1/oauth2/token',
                headers : {
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                form: {grant_type: 'refresh_token', refresh_token: refresh_token},
                json: true
            };

            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("body: " + body);
                    return callback(null, body);
                } else {
                    console.log("error::" + error);
                    console.log("response::"+response);
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
                    console.log(response);
                    return callback(error, null)
                }

            })
        }

        function getTransactions(accountId, access_token, callback) {

            var options = {
                uri: 'https://sandbox.api.macquariebank.io/connect/v1/accounts/'+accountId+'/transactions?limit=5',
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
                    console.log(response);
                    return callback(error, null)
                }

            })
        }

        function getBalances(accountId, access_token, callback) {

            var options = {
                uri: 'https://sandbox.api.macquariebank.io/connect/v1/accounts/'+accountId+'/balances',
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
                    console.log(response);
                    return callback(error, null)
                }

            })
        }
    }


}
