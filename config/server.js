// connection with Mongo db.
var mongoose = require('mongoose');

var url = "mongodb://admin:admin@ds049496.mlab.com:49496/liveStreaming";

//connect to the mongod server
mongoose.connect(url);