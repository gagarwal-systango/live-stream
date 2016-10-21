var express = require('express');
var app = module.exports = express();
var mongoose = require('mongoose');
var fs = require('fs');
var bodyParser = require('body-parser');
var jade = require('jade');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var mongoStore = require('connect-mongo')(session);
var path = require('path');
var config = require('./config/server').get(process.env.NODE_ENV);
var nodeSpotifyWebHelper = require('node-spotify-webhelper');
var spotifySDK = require('spotify-port-scanner-node');

var index = require('./routes/index');
var channelChunks = require('./models/channelChunks.js');
var channelFile = require('./models/channelFile.js');
var userHistory = require('./models/userHistory.js');
var audioInfo = require('./models/audioinfo.js');

var port = process.env.PORT || 3000;
var server = config.server;

var io = require('socket.io').listen(server);
var events = require('events');
var em = new events.EventEmitter();

require('./config/server');
require('./config/passport');

app.use(express.static(path.resolve(__dirname, 'public')));


app.use(validator());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());

var sessionMiddleware = session({
    secret: "secretkeytosavesession", //secret used to sign the session ID cookie
    resave: false, //if true: Forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized: false, //if true: Forces a session that is "uninitialized" to be saved to the store
    store: new mongoStore({ mongooseConnection: mongoose.connection }), //use existing mongoose connection
    cookie: ({ maxAge: 2 * 60 * 60 * 1000 }) //session expiry time in set-cookie attribute  
});
app.use(sessionMiddleware);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next) {
    res.locals.signin = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use('/', index);

var arr = [];

  //to use session in socket io, it creates middleware.
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
 
io.sockets.on('connection', function(socket) {   // First connection
    
    console.log('one user ' + socket.id + ' connected');
    var spotify;
    var spotify1;
    var pubroom = socket.request.session.pubroom;
    var subroom = socket.request.session.subroom;
    var user_id = socket.request.session.passport.user;
      
      //connect's spotify to our app 
    socket.on('add publisher', function() {  
         var client = new spotifySDK.SpotifyClient();
         client.connect({
                 lowPort: 3000,
                 highPort: 4800
             })
             .then(() => {
                 console.log("Spotify connected on port:"+ client.getPort());
                 spotify = new nodeSpotifyWebHelper.SpotifyWebHelper({ port: client.getPort() });
                 })
             .catch(error => {
                 console.log("Spotify Connection Error", error);
             });

        
        socket.room = pubroom;
        socket.join(pubroom);
    });
    
    //verifying token recieved from subscriber and adding him/her to socket. 
    socket.on('add subscriber', function(token) {
       var client = new spotifySDK.SpotifyClient();
        client.connect({
                lowPort: 3000,
                highPort: 4800
            })
            .then(() => {
                console.log("Spotify connected on port:"+ client.getPort());
                spotify1 = new nodeSpotifyWebHelper.SpotifyWebHelper({ port: client.getPort() });
                })
            .catch(error => {
                console.log("Spotify Connection Error", error);
            });

        
        channelFile.findOne({ channelName: subroom }, function(err, file) {
            if (!file) {
                socket.emit('tokenError', 'channel name is incorrect!');
            } else if (file.token != token) {
                socket.emit('tokenError', 'token is incorrect!');
            } else {
                socket.join(subroom);
            }
        });

    });

 //streaming video and audioinfo   
socket.on('image', sendChunk);   
var counter=0;
function sendChunk(imgdata) {
    
    socket.broadcast.to(socket.room).emit('stream', imgdata);
    var data = new Object();
    data.imgData = imgdata;
    
    //sending audio info after every 20 chunks of video data
    counter++;  
    var audiodata = new Object();
    if(counter==20){   
        
        if (spotify !== null && spotify !== undefined) {
            //gives information about song currently playing in spotify.
            spotify.getStatus(function(err, res) {  
                if (err) {
                    return console.error(err);
                }
                
                audiodata.id = res.track.track_resource.uri;
                audiodata.playingPosition = res.playing_position;
                 console.log('pos is: '+audiodata.playingPosition);
                if (audiodata !== null && audiodata !== undefined) {
                    socket.broadcast.to(socket.room).emit('stream1', audiodata);
                } 
                data.audioData = audiodata;
                arr.push(data);
                em.emit('data available', arr, socket.room);
            });            
        }
        counter=0;
    }
    else {
        data.audioData = audiodata;
        arr.push(data);
        em.emit('data available', arr, socket.room);
    }
    
}
   
  //fetching song information and playing it on native spotify player.
  socket.on('changesong', function(url){
   console.log('inside change song');
   if (spotify1 !== null && spotify1 !== undefined) {
    spotify1.play(url ,function(err, data){
			 if (err) {
				    return console.error(err);
				  }
				  console.log("song changed");
		});
   }
});

		
    //fetching video history
    socket.on('historyReq', function() {  
        channelFile.findOne({ channelName: app.get('channelName') }, function(err, file) {
            if (err) throw err;
            console.log(file);
            channelChunks.find({ channelFile: file._id }, function(err, chunks) {
                if (err) throw err;
                allChunks(0);

                function allChunks(index) {
                    if (chunks.length > index) {
                        setTimeout(function() {
                            socket.emit('historyData', chunks[index].data);
                            allChunks(++index);
                        }, 100);
                    }
                }
            });

        });
    });

    //storing video history 
    socket.on('disconnect', function() {   
        var channelName = pubroom || subroom;
        if (pubroom) {
            channelFile.findOneAndUpdate({ channelName: pubroom }, { live: false }, function(err, file) {
                if (err) {
                    console.log(err.stack);
                } else{
                    //socket.request.session.pubroom = null;
                    console.log(pubroom+': live video disconnected');
                }
                 });
        } 
       if (channelName){ 
           console.log(channelName);
                userHistory.findOne({user_id: user_id, channelName: channelName }, function(err, doc) {
                  if (doc === undefined || doc === null) { 
                      channelFile.findOne({ channelName: pubroom }, function(err, file) {
                if (err) {
                    console.log(err.stack);
                } 
                else{
                      var userhistory = new userHistory();
                      userhistory.user_id = user_id;
                      userhistory.channelName = channelName;
                       userhistory.save(function(err, file) {
                          if (err) throw err;
                          socket.leave(channelName);
                          console.log('video linked to user.');
                      });
                       }
                 });
               } else {
                      console.log('user exists');                                            
                      }
                });
                socket.request.session.pubroom = null;
                socket.request.session.subroom = null;
              }
          
        console.log('user disconnected');
        socket.leave(socket.room);
    });

});

// first it will save chunks and them corresponding to chunks it will save audioinfo
function saveStreamData(data, roomname) {   
    channelFile.findOneAndUpdate({ channelName: roomname }, { $inc: { totalChunks: 1 } }, function(err, file) {
        if (err) {
            console.log(err.stack);
        }
        var channelchunk = new channelChunks();
        channelchunk.channelFile = file;
        channelchunk.data = data.imgData.toString();
        channelchunk.n = file.totalChunks;
        channelchunk.save(function(err, file) {
            if (err){
                throw err;
            }
            else {
                console.log('chunk number: ' + file.n + ' saved');
                if(data.audioData.id !== undefined){
                    var audioinfo = new audioInfo();
                    audioinfo.channelChunk = file;
                    audioinfo.audio_pos = data.audioData.playingPosition;
                    audioinfo.song_id = data.audioData.id;
                    audioinfo.save(function(err, file){
                        if(err) throw err;
                        else {
                            console.log('audio saved');
                             }
                      })
                    }
                 }
        });
    });
}

em.on('data available', function(arr, roomname) {
    saveStreamData(arr.shift(), roomname);
});

server.listen(port, function() {
    console.log('Server is running on port ' + port);
});