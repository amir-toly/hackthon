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

//    handleRefresh: function(req, res) {
    handleRefresh: function(app_key) {
//        var app_key = req.query.appkey;
        console.log('app_key:' + app_key)
        var refresh_token;
        var summary = '';
        var j = 0;
        var balances_ = [];
        var transactions_ = [];
        var traList = [];
        var balList = [];


        Applications.findOne({ 'app_key': app_key }, 'app_key, refresh_token', function (err, app) {
            if (err) {
                console.log('err:' + err);
                redirect('/error');
            };
            console.log('Applications is:' + app)
            refresh_token = app.refresh_token;

            getNewAccessToken(refresh_token, function(err, body) {
                console.log('getNewAccessToken err:' + err);
                console.log('getNewAccessToken body:' + body);
                Applications.findOneAndUpdate({app_key: app_key},
                    { $set: {access_token: body.access_token,
                        refresh_token: body.refresh_token}}, function(err, app){

                        getAccounts(app.access_token, function(err, body) {
                            var accounts_ = body;
                            var accountsLength = body.accounts.length;

                            for(var i = 0; i < body.accounts.length; i++) {
                                var obj = body.accounts[i];

                                console.log(obj.account_id);

                                getBalances(obj.account_id, app.access_token, function(err, body) {

                                    //MQT.startAndPush("/topic/balances", JSON.stringify(body));
                                    balances_.push(body);
                                    balList.push(body.balances[0].balance)
                                    Applications.findOneAndUpdate({ app_key: app_key },
                                        {$set: {balances: body}},
                                        function(err, app){
                                            if(err) console.log('Error updating Applications');
                                        });

                                    getTransactions(obj.account_id, app.access_token, function(err, body) {

                                        //MQT.startAndPush("/topic/transactions", JSON.stringify(body));
                                        transactions_.push(body);

                                        body.transactions.forEach(function(element) {
                                            traList.push(element);
                                        });

                                        j++;

                                        if (j == accountsLength) {

                                            var mqqtMessage=formatMsg(accountsLength,balList,traList);
                                            MQT.startAndPush("/accounts/"+app_key, mqqtMessage);
                                        }

                                        Applications.findOneAndUpdate({ app_key: app_key },
                                            {$set: {transactions: body}},
                                            function(err, app){
                                                if(err) console.log('Error updating Applications');
                                            });
                                    });
                                });

                            }

                            //MQT.startAndPush("/topic/accounts", JSON.stringify(body));
                            console.log('accounts are: ' + body)

                            Applications.findOneAndUpdate({ app_key: app_key },
                                {$set: {accounts: body}},
                                function(err, app){
                                    if(err) console.log('Error updating Applications');
                                    //res.send(200);
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
                    console.log("body: ");
                    console.log(body);
                    return callback(null, body);
                } else {
                    console.log("error::" + error);
                    console.log("response::"+response);
                    console.log(body);
                    return callback(error, null)
                }

            })
        }

        function recursive( i, max )
        {
            if ( i > max ) return;
            i = i + 1;
            setTimeout( function(){ recursive(i, max); }, 150 );
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

        function formatMsg(numAcct, balances, transactions) {
            // numberof Acct|sum of bal|lastTrx of all|category

            var total=balances.reduce(getTotal,0);
            //sort all transactions

            transactions.sort(function(a, b){
                var keyA = new Date(a.transaction_date),
                    keyB = new Date(b.transaction_date);
                // Compare the 2 dates
                if(keyA < keyB) return -1;
                if(keyA > keyB) return 1;
                return 0;
            });
            return numAcct+"|"+total+"|"+transactions[0].amount+"|"+transactions[0].category;


        }

        function getTotal(total, num) {
            return total + num;
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
            recursive(1, 10);
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
            console.log("Balances for acct: "+ accountId)
            recursive(1, 10);
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
