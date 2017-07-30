var mongoose = require('mongoose'),
    Applications = mongoose.model('Applications');

module.exports = {
    all: function(req, res){
        console.log('we are in appls.all')
        Applications.find({}, function(err, applications){
            if(err) res.render('error', { error: 'Could not fetch items from database :('});
            console.log('in the callback')
            res.render('applications', { apps: applications });
        });
    },
    viewOne: function(req, res){
        Applications.find({ _id: req.params.id }, function(err, applications){
            res.render('applications', { apps: applications[0] })
        });
    },
    create: function(req, res){
        var appName = req.body.name;
        // create todo
        Applications.create({ name: appName }, function(err, applications){
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
    edit: function(req, applications){
        Applications.findOneAndUpdate({ _id: req.params.id }, {name: req.body.name}, function(err, todo){
            res.redirect('/applications');
        });
    }

};