var  mongoose = require('mongoose');
//var url = "mongodb://localhost:27017/canvas";
var url = "mongodb://admin:admin@ds049496.mlab.com:49496/canvas";

//connect to the mongod server
mongoose.connect(url);
