
//var configlkjlk = require('’);
// connection with Mongo db.
var mongoose = require('mongoose');


// var config = require('./config/index.js').get(process.env.NODE_ENV);
var config = {
  production: {
    
    database: 'mongodb://systango:systango1@ds047325.mlab.com:47325/livestreaming',
    
  },
  devalopment: {
    
    database: 'mongodb://localhost:27017/canvas',
    
  }
}

exports.get = function get(env) {
  return config[env] || config.development;
}
mongoose.connect(config.database, function (err, res) {
     if (err) {
     console.log ('ERROR connecting to: ' + config.database + '. ' + err);
     } else {
     console.log ('Succeeded connected to: ' +config.database);
     }
   });