var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('../models/user.js');

passport.serializeUser(function(user, done){
	done(null, user.id); //to store a user session serialize by id
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	});
});

passport.use('local.signup', new LocalStrategy({
	usernameField: 'user_id',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, user_id, password, done){
	req.checkBody('user_id', 'invalid user_id').notEmpty();
	req.checkBody('password', 'invalid password').notEmpty().isLength({min:6});
	var errors = req.validationErrors(); //function created by validators 
	if(errors){
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		//console.log(messages);
		return done(null, false, req.flash('error', messages));
	}
	User.findOne({ 'user_id': user_id }, function(err, user){
		if(err){
			return done(err);
		}
		if(user){
			return done(null, false, {message: "userID is already in use"});
		}
		var newUser = new User();
		newUser.user_id = user_id;
		newUser.password = newUser.encryptPassword(password);
		newUser.save(function(err, post){
			if (err) return done(err);
    		return done(null, newUser);
		});	
	});
}));


passport.use('local.signin', new LocalStrategy({
	usernameField: 'user_id',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, user_id, password, done){
	req.checkBody('user_id', 'invalid user_id').notEmpty();
	req.checkBody('password', 'invalid password').notEmpty();
	var errors = req.validationErrors();
	if(errors){
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		//console.log(messages);
		return done(null, false, req.flash('error', messages));
	}
	User.findOne({ 'user_id': user_id }, function(err, user){
		if(err){
			return done(err);
		}
		if(!user){
			return done(null, false, {message: "user not found!"});
		}
		if(!user.validPassword(password)){
			return done(null, false, {message: "incorrect password!"});
		}
		return done(null, user);	
	});
}));
