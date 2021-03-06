/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] no-unused-vars: ["error", { "args": "none" }] */
'use strict'

/**
 * This Module holds the main entrence to the server and route functionality
 *
 * @summary   The module holds the server functionality and  is the place where we take care of all the error handeling
 *
 * @since     25.12.2016
 * @requires Node.js, mongoose, express & mid
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/

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

mongoose.connect('mongodb://localhost:27017/api')

var db = mongoose.connection

// set our port
app.set('port', process.env.PORT || 5000)

// morgan gives us http request logging
app.use(morgan('dev'))

// parse incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

// setup our static route to serve files from the 'public' folder
app.use('/', express.static('public'))


app.use(mid.getAuth)

app.use('/api', api)


// catch a 404 and forward the error to the handler
app.use(function(req, res, next) { //<-- see that this has no error, therefore this middleware is called last if there has been no other route to take up the request
    var err = new Error('404 File Not Found')
    err.status = 404 //Set status to 404
    next(err) //Send to error handler
})

//The error handler
app.use(function(err, req, res, next) {
    if (err.name === 'ValidationError') { // error handler, that takes care of Mongoose validation errors
        var properties = []
        var errors = err.errors

        for (let errorProp in errors) {
            properties.push({
                message: errors[errorProp].message,
                code: errors[errorProp].kind
            })
        }
        err = {
            'message': 'Validation Failed',
            'errors': {
                'property': properties
            },
            'status': err.status
        }
    } else {//It is an uncought error so we return the message with a status
        err = {
            'message': err.message,
            'status': err.status
        }
    }
    res.status(err.status || 500)
    return res.json(err) //We send the error
})


//Incase of a database error
db.on('error', function(err) {
    console.log('Failed to connect to database')
    console.error('connection error:', err)
})

//When we open the database
db.once('open', function() {
    console.log('db connection successful')

    //Uncomment to turn on seeder
    seeder.seed(data, {
        dropCollections: true
    })

    // start listening on our port
    var server = app.listen(app.get('port'), function() {
        console.log('Express server is listening on port ' + server.address().port)
    })
})
