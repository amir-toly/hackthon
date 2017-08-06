var express = require('express');
var router = express.Router();
var Apps = require('./applications');
var Mop = require('./mop');
var Refresh = require('./refresh');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){

		res.render('home', { user: req.user });
	});

	/* Mop Callback*/
	router.get('/callback', Mop.handleCallback)
    router.get('/refresh-all', Refresh.handleRefresh)

	/* GET apps Page */
	router.get('/applications', isAuthenticated,Apps.all);
	router.get('/application/:id', isAuthenticated,Apps.viewOne);
    router.post('/applications/create', isAuthenticated,Apps.create);
    router.post('/applications/destroy/:id', isAuthenticated,Apps.destroy);
	router.post('/applications/edit/:id',isAuthenticated,Apps.edit);
	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}




