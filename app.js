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
var mongoStore = require('connect-mongo')(session);
var path = require('path');
var port = process.env.PORT || 3000;

var server = require('https').createServer({
      key: fs.readFileSync(__dirname+'/ssl/key.pem'),
      cert: fs.readFileSync(__dirname+'/ssl/cert.pem')
    }, app);
//var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


var index = require('./routes/index');
var channelChunks = require('./models/channelChunks.js');
var channelFile = require('./models/channelFile.js');
var userHistory = require('./models/userHistory.js');

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
    cookie: ({ maxAge: 24 * 60 * 60 * 1000 }) //session expiry time in set-cookie attribute  
})
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

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.sockets.on('connection', function(socket) { // First connection
    //var room = io.sockets.adapter.rooms;
    console.log('one user ' + socket.id + ' connected');

    var pubroom = socket.request.session.pubroom;
    var subroom = socket.request.session.subroom;
    var user_id = socket.request.session.passport.user;

    socket.on('add publisher', function() {
        socket.room = pubroom;
        socket.join(pubroom);
    });

    socket.on('add subscriber', function(token) {
        //socket.room = roomname;
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

    socket.on('image', sendChunk);

    function sendChunk(data) {
        socket.broadcast.to(socket.room).emit('stream', data);
        //var buf = new Buffer(data);
        //arr.push(data);
        //em.emit('data available', arr, socket.room);
    }


    socket.on('disconnect', function() {
        if (pubroom) {
            channelFile.findOneAndUpdate({ channelName: pubroom }, { live: false }, function(err, file) {
                if (err) {
                    console.log(err.stack);
                } else
                    console.log('live video disconnected');
                var userhistory = new userHistory();
                userhistory.user_id = user_id;
                userhistory.channelName = pubroom;
                userhistory.save(function(err, file) {
                    if (err) throw err;
                    socket.leave(pubroom);
                    console.log('video linked to user.');
                })
            });
        }
        console.log('user disconnected');
        socket.leave(socket.room);
    });

});

function saveChunk(buf, roomname) {
    channelFile.findOneAndUpdate({ channelName: roomname }, { $inc: { totalChunks: 1 } }, function(err, file) {
        if (err) {
            console.log(err.stack);
        }
        var channelchunk = new channelChunks();
        channelchunk.channelFile = file;
        channelchunk.data = buf.toString();
        channelchunk.n = file.totalChunks;
        channelchunk.save(function(err, file) {
            if (err)
                throw err;
            else
                console.log('chunk number: ' + file.n + ' saved');
        });
    });
}

em.on('data available', function(arr, roomname) {
    saveChunk(arr.shift(), roomname);
});

server.listen(port, function() {
    console.log('Server is running on port ' + port);
});