var mongoose = require('mongoose'),
    UserToken = mongoose.model('UserToken');

module.exports = {

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
            res.redirect('/applications');
        });
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