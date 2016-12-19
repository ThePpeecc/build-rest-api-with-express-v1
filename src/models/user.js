var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var userSchema = new mongoose.Schema({
    fullName: String,
    emailAddress: String,
    password: String
})

userSchema.pre('save', function(next) {
    //this is here an instance of the userSchema
    const saltRounds = 10 //pew pew pew
    bcrypt.hash(this.password, saltRounds, function(err, hash) {
        if (err) {
            next(err)
        }
        this.password = hash
        next()
    })
})


module.exports.User = mongoose.model('User', userSchema)
