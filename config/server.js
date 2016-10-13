var express = require('express');
var fs = require('fs');
var app = require('../app');
// connection with Mongo db.
var mongoose = require('mongoose');

var config = {
  production: {
    
    database: 'mongodb://systango:systango1@ds047325.mlab.com:47325/livestreaming',
    server: require('http').createServer(app)
  },
  
  development: {
    
    database: 'mongodb://localhost:27017/canvas',
    server:  require('https').createServer({
       key: fs.readFileSync(__dirname+'/ssl/key.pem'),
       cert: fs.readFileSync(__dirname+'/ssl/cert.pem')
     }, app)
    
  }
}

exports.get = function get(env) {
  return config[env] || config.development;
}
mongoose.connect(config[process.env.NODE_ENV].database, function (err, res) {
     if (err) {
     console.log ('ERROR connecting to: ' + config[process.env.NODE_ENV].database + '. ' + err);
     } else {
     console.log ('Succeeded connected to: ' +config[process.env.NODE_ENV].database);
     }
   });