'use strict'

/**
 * @summary   This module holds the User mongo schema and Model
 *
 * @since     25.12.2016
 * @requires Node.js, mongoose & bcrypt
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    uniqueValidator = require('mongoose-unique-validator')

//The regex we use for the email
var emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

//We setup the user schema
var userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'We need a name'],
        trim: true
    },
    emailAddress: {
        type: String,
        unique: [true, 'User with this email already exist'],
        match: [emailReg, 'The email needs to be in a valid format'],
        required: [true, 'We need an email'],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'We need a password']
    },
    confirmPassword: {
        type: String,
        required: [true, 'We need a confirm password']
    }
}, { id: false })


//Here we validate if the password and confirmPassword match
userSchema.pre('validate', function(next) {
    if (this.password !== this.confirmPassword) {
        this.invalidate('password', 'The Password submitted dose not match the confirm password')
    }
    next()
})


userSchema.pre('save', function(next) {
    const saltRounds = 10 //pew pew pew
    var user = this
        //You may think that this is not nessesary, BUT IT IS!
        //If you don't assign this to user the hashed password can't get assigned to the password, and therefore won't get saved

    bcrypt.hash(user.password, saltRounds, function(err, hash) {

        if (err) {
            next(err)
        }
        //Since mongoosejs .pre 'save' calls the .pre 'validate' function before exicuting,
        //this function will only exicute if the validate function is validated
        //therefore the confirmPassword must be eaqual to password so
        //to save calulating time and code space we can assign password and confirmPassword to the same hash

        user.password = hash
        user.confirmPassword = hash

        return next()
    })
})

userSchema.plugin(uniqueValidator) //This makes the uniqe validation error look the same as the other validation errors

module.exports.User = mongoose.model('User', userSchema)
