var express = require('express'),
    router = express.Router();
    passport = require('passport'),
    User = require('./../models/user.js'),
    path = require('path');

router.use(express.static(path.join(__dirname, '/../public')));

//var logoutEvent = require('./channel.js').eventemitter;

router.get('/logout', isLoggedIn, function(req, res, next){
    //removing session
    req.session.destroy(function(err) {
        if(err){
          console.log(err);
        }
    });
    //method added by passport
    req.logout();    
    console.log("logging out");
    //logoutEvent.emit('logout-msg', { "message": "you have successfully logged out."});
    res.redirect('/');
});

//use notloggedin for all user routes written after it
router.use('/', notLoggedIn, function(req, res, next){
    next();
});

router.get('/signup', function(req, res, next){
    var messages = req.flash('error');
    console.log(messages);
    res.render('signup', {msg: messages});
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/user/signup',
    failureFlash: true
}));
 
router.get('/signin', function(req, res, next){
    var messages = req.flash('error');
    console.log(messages);
    res.render('signin', {msg: messages});
});

router.post('/signin', passport.authenticate('local.signin', {
  successRedirect: '/',
  failureRedirect: '/user/signin',
  failureFlash: true
}));

module.exports = router;

//passport method for logging in and logiing out
//middelware
//check for logged in
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  };
  res.redirect('/');
}

//check for not logged in
function notLoggedIn(req, res, next){
  if (!req.isAuthenticated()){
    return next();
  };
  res.redirect('/');
}



