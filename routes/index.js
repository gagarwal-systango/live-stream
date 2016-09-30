var express = require('express');
var router = express.Router();
var ChannelFile = require('./../models/channelFile.js')

var path = require('path');

router.get('/', function(req, res, next){	
  res.render('index');
});

router.get('/allCh', function(req, res){
  ChannelFile.find(function(err, files){
    if(err) throw err;
    res.render('allch', {ChannelFile: files});
  })
});

// router.use('/', isLoggedIn, function(req, res, next){
//     next();
// });

router.get('/newch', isLoggedIn, function(req, res, next){	
  res.render('newch', {msg: ''});
});

router.post('/newch', function(req, res, next){	
  if(!req.body.channelName){
    res.render('newch', {msg: 'Please give a channel name!'});
  }
  else if(!req.body.token){
    res.render('newch', {msg: 'Please give a token!'});
  }
  else{
    ChannelFile.findOne({channelName: req.body.channelName}, function(err, file){
      if(file){
        res.render('newch', {msg: 'channel name already exist!'});
      }
      else{
        var channelFile = new ChannelFile();
        channelFile.channelName = req.body.channelName;
        channelFile.totalChunks = 0;
        channelFile.token = req.body.token;
        //channelFile.live = false
        channelFile.save(function(err, file){
          if(err) throw err;
          console.log("file: "+file.channelName);
          req.session.pubroom = file.channelName;
          res.render('emitter', {roomname: file.channelName});
        })
      }  
    })
  }

});

router.get('/emitter', isLoggedIn, function(req, res, next){	
  res.render('emitter');
});

router.get('/channel/:channelName', isLoggedIn, function (req, res) {
  req.session.pubroom = req.params.channelName;
  res.render('visualizer', {name: req.params.channelName});
});

router.get('/hs', function(req, res, next){	
  res.render('hs');
});


module.exports = router;
	

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  };
  res.redirect('/user/signin');
}