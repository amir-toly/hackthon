var mongoose = require('mongoose'),
    Applications = mongoose.model('Applications');
    Mop = mongoose.model('Mop');
module.exports = {
    all: function(req, res){
        console.log('we are in appls.all');
        console.log('user is' + req.user);
        Applications.find({'user_id': req.user._id}, function(err, applications){
            if(err) res.render('error', { error: 'Could not fetch items from database :('});
            console.log('in the callback')
            res.render('applications', { apps: applications });
        });
    },
    viewOne: function(req, res){
        var id = req.params.id;
        console.log('id to be edited'+ id);
        Applications.findById(id, function(err, applications){
            if(err) res.render('error', { error: 'Could not fetch items from database :('});
            console.log('App to be edited'+applications);
            Mop.findOne({ app_key: Applications.app_key },function (err,mops) {
                if (err) res.render('error', {error: 'getting Applications mop'})
                if(mops) {
                    res.render('application', {oneapp: applications, accounts: mops.accounts});
                }else {
                    res.render('application', {oneapp: applications, accounts:null});
                }
            })


        });
    },
    create: function(req, res){
        var appName = req.body.name;
        // create todo
        Applications.create({ name: appName,user_id: req.user._id, description: req.body.description, app_key: req.body.app_key  }, function(err, applications){
            if(err) res.render('error', { error: 'Error creating your apps :('})
            // reload collection
            res.redirect('/applications');
        });
    },
    destroy: function(req, res){
        var id = req.params.id;

        Applications.findByIdAndRemove(id, function(err, applications){
            if(err) res.render('error', { error: 'Error deleting Applications'});
            Mop.findOneAndRemove({ app_key: Applications.app_key },function (err,mops) {
                if(err) res.render('error', { error: 'Error deleting Applications mop'});
                res.redirect('/applications');
            });

        });
        //remove the MOP obj with the appkey
        // Mop.findBy(app_key )
    },
    edit: function(req, res){
        var id = req.params.id;
        console.log('editing app name'+ req.body.name);
        console.log('editing app desc'+ req.body.description);
        Applications.findOneAndUpdate({ _id: req.params.id },
                {$set: {name: req.body.name, description: req.body.description, app_key: req.body.app_key}},
            function(err, applications){
                if(err) res.render('error', { error: 'Error updating Application'});
            res.redirect('/applications');
        });
    }

};