var express = require('express');
var router = express.Router();
var channelFile = require('./../models/channelFile.js')
var passport = require('passport');
var path = require('path');


router.get('/', isLoggedIn, function(req, res, next) {
    res.render('home', { user: req.user });
});

router.get('/allCh', isLoggedIn, function(req, res) {
    channelFile.find({ live: true }, function(err, files) {
        if (err) throw err;
        res.render('allch', { ChannelFile: files, user: req.user });
    });
});

router.get('/newch', isLoggedIn, function(req, res, next) {
    res.render('newch', { msg: '', user: req.user });
});

router.post('/newch', function(req, res, next) {
    if (!req.body.channelName) {
        res.render('newch', { msg: 'Please give a channel name!', user: req.user });
    } else if (!req.body.token) {
        res.render('newch', { msg: 'Please give a token!', user: req.user });
    } else {
        channelFile.findOne({ channelName: req.body.channelName }, function(err, file) {
            if (file) {
                res.render('newch', { msg: 'channel name already exist!', user: req.user });
            } else {
                var channelFile = new channelFile();
                channelFile.channelName = req.body.channelName;
                channelFile.totalChunks = 0;
                channelFile.token = req.body.token;
                channelFile.live = true;
                channelFile.save(function(err, file) {
                    if (err) throw err;
                    console.log("file: " + file.channelName);
                    req.session.pubroom = file.channelName;
                    res.render('emitter', { roomname: file.channelName, user: req.user });
                });
            }
        });
    }

});

router.get('/emitter', isLoggedIn, function(req, res, next) {
    res.render('emitter', { user: req.user });
});

router.get('/channel/:channelName', isLoggedIn, function(req, res) {
    req.session.subroom = req.params.channelName;
    res.render('visualizer', { name: req.params.channelName, user: req.user });
});

router.get('/hs', function(req, res, next) {
    res.render('hs');
});


router.get('/logout', isLoggedIn, function(req, res, next) {
    //removing session
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        }
    });
    //method added by passport
    req.logout();
    console.log("logging out");
    res.redirect('/');
});

//use notloggedin for all user routes written after it
router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.get('/loginSignup', function(req, res, next) {
    var messages = req.flash('error');
    console.log(messages);
    res.render('loginSignup', { msg: messages, user: req.user });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/home',
    failureRedirect: '/loginSignup',
    failureFlash: true
}));

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/home',
    failureRedirect: '/loginSignup',
    failureFlash: true
}));

module.exports = router;

//passport method for logging in and logiing out
//middelware
//check for logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/loginSignup');
}

//check for not logged in
function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}