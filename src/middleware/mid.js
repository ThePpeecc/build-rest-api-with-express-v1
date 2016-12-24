var User = require('../models/user').User,
    auth = require('basic-auth'),
    bcrypt = require('bcrypt')

var getAuth = function(req, res, next) {
    var userAuth = auth(req) //We get the authentication parameters from the browser
    if (userAuth) { //If they have sendt us any authentication
        User.findOne({
                "emailAddress": userAuth.name //We find the user by the email
            })
            .exec(function(err, user) {
                if (err) {
                    next(err)
                }
                if (user) {
                    bcrypt.compare(userAuth.pass, user.password, function(err, res) { //We compare the user we found password with the supplied authentication
                        if (err) {
                            next(err)
                        }
                        if (res) { //true if they match false else
                            req.currentUser = user
                        }
                        next()
                    })
                }else {
                  next()
                }
            })
    } else {
        next()
    }
}

var isAuth = function(req, res, next) {
    if (req.currentUser) {
        next()
    } else {
        var err = new Error('Not Authorized, please login')
        err.status = 401;
        next(err)
    }
}



module.exports.getAuth = getAuth
module.exports.isAuth = isAuth
