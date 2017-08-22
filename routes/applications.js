var mongoose = require('mongoose'),
    Applications = mongoose.model('Applications');

var types = ['Fridge-ATM', 'T-Shirt'];

module.exports = {
    all: function(req, res){
        console.log('we are in appls.all');
        console.log('user is' + req.user);
        Applications.find({'user_id': req.user._id}, function(err, applications){
            if(err) res.render('error', { error: 'Could not fetch items from database :('});
            console.log('in the callback')
            console.log(applications)
            res.render('applications', { apps: applications, types: types });
        });
    },
    viewOne: function(req, res){
        var id = req.params.id;
        console.log('id to be edited'+ id);
        Applications.findById(id, function(err, applications){
            if(err) res.render('error', { error: 'Could not fetch items from database :('});
            console.log('App to be edited'+applications);
            if(applications.accounts.length > 0) {
                console.log('linked accounts found');
                console.log(applications.accounts);
                res.render('application', {oneapp: applications, accounts: applications.accounts[0].accounts, types: types});
            }else {
                console.log('NO linked accounts');
                res.render('application', {oneapp: applications, accounts:null, types: types});
            }
        });
    },
    create: function(req, res){
        var appName = req.body.name;
        // create todo
        Applications.create({ name: appName,user_id: req.user._id, description: req.body.description, type: req.body.type,app_key: req.body.app_key  }, function(err, applications){
            if(err) res.render('error', { error: 'Error creating your apps :('})
            // reload collection
            res.redirect('/applications');
        });
    },
    destroy: function(req, res){
        var id = req.params.id;

        Applications.findByIdAndRemove(id, function(err, applications){
            if(err) res.render('error', { error: 'Error deleting Applications'});
            res.redirect('/applications');
        });
    },
    edit: function(req, res){
        var id = req.params.id;
        console.log('editing app name'+ req.body.name);
        console.log('editing app desc'+ req.body.description);
        Applications.findOneAndUpdate({ _id: req.params.id },
                {$set: {name: req.body.name, description: req.body.description, type: req.body.type, app_key: req.body.app_key}},
            function(err, applications){
                if(err) res.render('error', { error: 'Error updating Application'});
            res.redirect('/applications');
        });
    }

};