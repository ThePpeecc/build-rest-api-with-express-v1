'use strict'

// load modules
var express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    seeder = require('mongoose-seeder'),
    data = require('./data/data.json'),
    mid = require('./middleware/mid')

var app = express()

var api = require('./routes/api.js')

mongoose.connect("mongodb://localhost:27017/api")

var db = mongoose.connection

// set our port
app.set('port', process.env.PORT || 5000)

// morgan gives us http request logging
app.use(morgan('dev'))

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'))


app.use(mid.getAuth)

app.use('/api', api)


// catch a 404 and forward the error to the handler
app.use(function(req, res, next) { //<-- see that this has no error, therefore this middleware is called last if there has been no other route to take up the request
    var err = new Error('404 File Not Found')
    err.status = 404 //Set status to 404
    next(err) //Send to error handler
})

//Middleware error handler, that takes care of Mongoose validation errors
app.use(function(err, req, res, next) {
    if (err.name === 'ValidationError') {
        var properties = []
        var errors = err.errors

        for (let errorProp in errors) {
            console.log(errors[errorProp].message);
            properties.push({
                message: errors[errorProp].message,
                code: errors[errorProp].kind
            })
        }

        err = {
            "message": "Validation Failed",
            "errors": {
                "property": properties
            },
            "status": err.status
        }
    }
    return next(err)
})


app.use(function(err, req, res, next) {
    res.status = err.status ||  500
    return res.json(err)
})

//Incase of a database error
db.on("error", function(err) {
    console.error("connection error:", err)
})

//When we open the database
db.once("open", function() {
    console.log("db connection successful")

    if (true) { //Key to turn seeder on
        seeder.seed(data, {
            dropCollections: true
        }).then(function(dbData) {
            console.log(dbData)
        }).catch(function(err) {
            // handle error
            console.log(err)
        })
    }

    // start listening on our port
    var server = app.listen(app.get('port'), function() {
        console.log('Express server is listening on port ' + server.address().port)
    })
})
