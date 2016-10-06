// connection with Mongo db.
var mongoose = require('mongoose');

var url = "mongodb://systango:systango1@ds047325.mlab.com:47325/livestreaming"

//connect to the mongod server
mongoose.connect(url);