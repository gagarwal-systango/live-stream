var mongoose = require('mongoose');

var url = "mongodb://localhost:27017/canvas";

//connect to the mongod server
mongoose.connect(url);