var express = require('express');
var app = express();
var mongoose = require('mongoose');
var fs = require('fs');
var bodyParser = require('body-parser');
var jade = require('jade');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var port = process.env.PORT || 3000;

var server = require('https').createServer({
      key: fs.readFileSync(__dirname+'/ssl/key.pem'),
      cert: fs.readFileSync(__dirname+'/ssl/cert.pem')
    }, app);
var io = require('socket.io').listen(server);


var index = require('./routes/index');
var ChannelChunks = require('./models/channelChunks.js');
var ChannelFile = require('./models/channelFile.js');
var Video = require('./models/video.js');

var events = require('events');
var em = new events.EventEmitter();

require('./config/server');
require('./config/passport');

app.use(express.static(__dirname + '/public'));


app.use(validator());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));

app.use(cookieParser());

var sessionMiddleware = session({
	secret: "secretkeytosavesession", //secret used to sign the session ID cookie
	resave: false, //if true: Forces the session to be saved back to the session store, even if the session was never modified during the request.
	saveUninitialized: false, //if true: Forces a session that is "uninitialized" to be saved to the store
	store: new MongoStore({ mongooseConnection: mongoose.connection }), //use existing mongoose connection
	cookie: ({ maxAge: 24*60*60*1000}) //session expiry time in set-cookie attribute  
})
app.use(sessionMiddleware);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next){
res.locals.signin = req.isAuthenticated();
res.locals.session = req.session;
next();
 });


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use('/', index);

var arr = [];

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.sockets.on('connection', function (socket) { // First connection
    //var room = io.sockets.adapter.rooms;
    console.log('one user '+socket.id+' connected');
    
    var pubroom = socket.request.session.pubroom;
    var subroom = socket.request.session.subroom;
    var user_id = socket.request.session.passport.user;
    
    socket.on('add publisher', function(){
        socket.room = pubroom;
        socket.join(pubroom);
    });

    socket.on('add subscriber', function(token){
        //socket.room = roomname;
        ChannelFile.findOne({channelName:subroom}, function(err, file){
            if(!file){
                socket.emit('terror', 'channel name is incorrect!');
            }
            else if(file.token != token){
                socket.emit('terror', 'token is incorrect!');
            }
            else{
                socket.join(subroom);
            }
        });
        
    });

    socket.on('image', sendChunk);
    
    function sendChunk (data){
        socket.broadcast.to(socket.room).emit('stream',data);
        var buf = new Buffer(data);
        arr.push(data);
        em.emit('data available', arr, socket.room);
    }

    socket.on('ready', function(){
        ChannelFile.findOne({channelName: 'garvit'}, function (err, file) {
    	    if(err) throw err;
            console.log(file);
            myLoop(file,0);
        });
    });

	function myLoop (file,i) {         
   		var s = setTimeout(function () {   
    	  ChannelChunks.findOne({channelFile: file._id, n: i}, function(err, chunk){
    		if(err) throw err;
    		socket.emit('stream', chunk.data.toString());
			console.log(i);
    	  });
		  i++;
		  if(i<file.totalChunks){
			  myLoop(file,i);
		  }  
          else{
              socket.emit('finish');
          }
   		}, 100);
	}	
    
   socket.on('disconnect', function () {
       if(pubroom){
           ChannelFile.findOneAndUpdate({channelName : pubroom}, {live: false}, function(err, file) {
		       if (err) {
		       	console.log(err.stack);
		       }
               else
                console.log('live video disconnected'); 
                var video = new Video();
                video.user_id = user_id;
                video.channelName = pubroom;
                video.save(function(err, file){
                  if(err) throw err;
                  socket.leave(pubroom);
                  console.log('video linked to user.');
                })
           });
       }
       console.log('user disconnected');
       socket.leave(socket.room);
   });

});

function saveChunk(buf, roomname){
    ChannelFile.findOneAndUpdate({channelName : roomname}, { $inc: { totalChunks: 1} }, function(err, file) {
		if (err) {
			console.log(err.stack);
		}
		var channelChunk = new ChannelChunks();
		channelChunk.channelFile = file;
		channelChunk.data = buf.toString();
		channelChunk.n = file.totalChunks;
		channelChunk.save(function(err, file) {
			if (err)
				throw err;
			else 
                console.log('chunk number: ' + file.n + ' saved');
		})
	});
};

em.on('data available', function(arr, roomname){
    saveChunk(arr.shift(), roomname);
})

//  https.createServer({
//       key: fs.readFileSync('key.pem'),
//       cert: fs.readFileSync('cert.pem')
//     }, app).listen(3000);

server.listen(port, function() {
	console.log('Server is running on port ' + port);
});
