'use strict';

// load modules
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var api = require('./routes/api.js');

mongoose.connect("mongodb://localhost:27017/api");

var db = mongoose.connection

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

app.use('/api', api);

//Incase of db eror
db.on("error", function(err){
	console.error("connection error:", err);
});

//When we open the db
db.once("open", function(){
	console.log("db connection successful");
  // start listening on our port
  var server = app.listen(app.get('port'), function() {
    console.log('Express server is listening on port ' + server.address().port);
  });
});
